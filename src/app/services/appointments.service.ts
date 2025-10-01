import { Injectable, inject } from '@angular/core';
import { 
  Firestore, 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  runTransaction,
  orderBy,
  Timestamp,
  serverTimestamp,
  getDoc,
  arrayRemove,
  arrayUnion
} from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';

export interface DateDoc {
  dateId: string;
  date: string;
  displayDate: string;
  availableTimeIds: string[];
  createdAt: Timestamp;
}

export interface TimeDoc {
  timeId: string;
  time: string;
  hour: number;
  minute: number;
  period: 'AM' | 'PM';
  createdAt: Timestamp;
}

export interface Appointment {
  appointmentId: string;
  dateId: string;
  timeId: string;
  userId: string;
  date: string;
  time: string;
  status: 'confirmed' | 'cancelled';
  createdAt: Timestamp;
  cancelledAt?: Timestamp;
}

@Injectable({
  providedIn: 'root'
})
export class AppointmentsService {
  private firestore = inject(Firestore);
  private auth = inject(Auth);

  /**
   * Get all times data (cached for efficiency)
   */
  private timesCache: Map<string, TimeDoc> = new Map();
  
  /**
   * Cache for date documents (expires after 5 minutes)
   */
  private datesCache: Map<string, { data: DateDoc; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  
  async getAllTimes(): Promise<TimeDoc[]> {
    if (this.timesCache.size > 0) {
      return Array.from(this.timesCache.values());
    }

    const timesRef = collection(this.firestore, 'times');
    const snapshot = await getDocs(timesRef);
    const times = snapshot.docs.map(doc => doc.data() as TimeDoc);
    
    times.forEach(time => this.timesCache.set(time.timeId, time));
    return times;
  }

  /**
   * Get a specific date with its available time slots (with caching)
   */
  async getDateAvailability(dateId: string): Promise<DateDoc | null> {
    // Check cache first
    const cached = this.datesCache.get(dateId);
    const now = Date.now();
    
    if (cached && (now - cached.timestamp) < this.CACHE_DURATION) {
      console.log(`📦 [Cache Hit] Date ${dateId} loaded from cache`);
      return cached.data;
    }
    
    // Fetch from Firestore
    console.log(`🔄 [Cache Miss] Fetching date ${dateId} from Firestore`);
    const dateRef = doc(this.firestore, 'dates', dateId);
    const dateDoc = await getDoc(dateRef);
    
    if (!dateDoc.exists()) {
      return null;
    }
    
    const data = dateDoc.data() as DateDoc;
    
    // Update cache
    this.datesCache.set(dateId, { data, timestamp: now });
    
    return data;
  }
  
  /**
   * Clear date cache (call after booking to refresh availability)
   */
  clearDateCache(dateId?: string) {
    if (dateId) {
      this.datesCache.delete(dateId);
      console.log(`🗑️ Cleared cache for date: ${dateId}`);
    } else {
      this.datesCache.clear();
      console.log(`🗑️ Cleared entire date cache`);
    }
  }

  /**
   * Get all dates (for calendar display)
   */
  async getAllDates(): Promise<DateDoc[]> {
    const datesRef = collection(this.firestore, 'dates');
    const snapshot = await getDocs(datesRef);
    return snapshot.docs.map(doc => doc.data() as DateDoc);
  }

  /**
   * Get available time slots for a specific date
   */
  async getAvailableTimesForDate(dateId: string): Promise<TimeDoc[]> {
    const dateData = await this.getDateAvailability(dateId);
    
    if (!dateData || dateData.availableTimeIds.length === 0) {
      return [];
    }

    // Get all times and filter by available IDs
    const allTimes = await this.getAllTimes();
    return allTimes.filter(time => dateData.availableTimeIds.includes(time.timeId));
  }

  /**
   * Book an appointment (creates appointment and removes timeId from date's availableTimeIds)
   * Uses Firestore transaction for atomicity
   */
  async bookAppointment(dateId: string, timeId: string): Promise<{ success: boolean; appointmentId?: string; error?: string }> {
    const currentUser = this.auth.currentUser;
    
    if (!currentUser) {
      return { success: false, error: 'User not authenticated' };
    }

    try {
      const appointmentId = await runTransaction(this.firestore, async (transaction) => {
        // Check if timeId is still in the date's availableTimeIds array
        const dateRef = doc(this.firestore, 'dates', dateId);
        const dateDoc = await transaction.get(dateRef);

        if (!dateDoc.exists()) {
          throw new Error('Date not found');
        }

        const dateData = dateDoc.data() as DateDoc;
        if (!dateData.availableTimeIds.includes(timeId)) {
          throw new Error('Time slot is no longer available');
        }

        // Get time data for display
        const timeRef = doc(this.firestore, 'times', timeId);
        const timeDoc = await transaction.get(timeRef);
        if (!timeDoc.exists()) {
          throw new Error('Time not found');
        }
        const timeData = timeDoc.data() as TimeDoc;

        // Remove timeId from availableTimeIds array
        transaction.update(dateRef, { 
          availableTimeIds: arrayRemove(timeId) 
        });

        // Create appointment
        const appointmentRef = doc(collection(this.firestore, 'appointments'));
        transaction.set(appointmentRef, {
          appointmentId: appointmentRef.id,
          dateId,
          timeId,
          userId: currentUser.uid,
          date: dateData.date,
          time: timeData.time,
          status: 'confirmed',
          createdAt: serverTimestamp()
        });

        return appointmentRef.id;
      });

      // Clear cache for this date after successful booking
      this.clearDateCache(dateId);

      return { success: true, appointmentId };
    } catch (error: any) {
      console.error('Error booking appointment:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get all appointments for the current user
   */
  async getUserAppointments(): Promise<Appointment[]> {
    const currentUser = this.auth.currentUser;
    
    if (!currentUser) {
      return [];
    }

    const appointmentsRef = collection(this.firestore, 'appointments');
    const q = query(
      appointmentsRef,
      where('userId', '==', currentUser.uid),
      where('status', '==', 'confirmed'),
      orderBy('date', 'asc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as Appointment);
  }

  /**
   * Cancel an appointment (marks as cancelled and adds timeId back to date's availableTimeIds)
   */
  async cancelAppointment(appointmentId: string): Promise<{ success: boolean; error?: string }> {
    const currentUser = this.auth.currentUser;
    
    if (!currentUser) {
      return { success: false, error: 'User not authenticated' };
    }

    try {
      await runTransaction(this.firestore, async (transaction) => {
        // Verify appointment belongs to current user
        const appointmentRef = doc(this.firestore, 'appointments', appointmentId);
        const appointmentDoc = await transaction.get(appointmentRef);

        if (!appointmentDoc.exists()) {
          throw new Error('Appointment not found');
        }

        const appointment = appointmentDoc.data() as Appointment;
        if (appointment.userId !== currentUser.uid) {
          throw new Error('Unauthorized');
        }

        // Add timeId back to date's availableTimeIds array
        const dateRef = doc(this.firestore, 'dates', appointment.dateId);
        transaction.update(dateRef, { 
          availableTimeIds: arrayUnion(appointment.timeId) 
        });

        // Update appointment status
        transaction.update(appointmentRef, {
          status: 'cancelled',
          cancelledAt: serverTimestamp()
        });
      });

      return { success: true };
    } catch (error: any) {
      console.error('Error cancelling appointment:', error);
      return { success: false, error: error.message };
    }
  }
}
