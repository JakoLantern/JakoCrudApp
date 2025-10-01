import { Component, Output, EventEmitter, PLATFORM_ID, Inject, OnInit, inject, ViewEncapsulation } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, EventInput } from '@fullcalendar/core'; 
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { AppointmentsService, DateDoc } from '../../../../services/appointments.service';
import { DateSelectedEvent } from '../../../../models/booking.types';
import { SkeletonLoader } from '../../../../shared/skeleton-loader/skeleton-loader';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.html',
  styleUrl: './calendar.scss',
  imports: [FullCalendarModule, CommonModule, SkeletonLoader],
  encapsulation: ViewEncapsulation.None // Force styles to apply globally
})
export class CalendarComponent implements OnInit {
  @Output() dateSelected = new EventEmitter<DateSelectedEvent>();
  
  isBrowser: boolean;
  isLoadingCalendar = true; // Add loading state
  private appointmentsService = inject(AppointmentsService);
  private dateAvailability: Map<string, DateDoc> = new Map();
  selectedDateStr: string | null = null;

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  async ngOnInit() {
    if (this.isBrowser) {
      this.isLoadingCalendar = true;
      await this.loadDateAvailability();
      // Set today as default selected date
      this.selectTodayIfAvailable();
      this.isLoadingCalendar = false;
    }
  }

  private selectTodayIfAvailable() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // FIX: Use local date components to build dateStr
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    const day = today.getDate();
    const todayStr = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    
    console.log('🔍 Checking if today is available:', todayStr);
    const todayDoc = this.dateAvailability.get(todayStr);
    console.log('📄 Today document:', todayDoc);
    const availableCount = todayDoc?.availableTimeIds?.length ?? 0;
    console.log('📊 Available slots for today:', availableCount);
    
    if (todayDoc && availableCount > 0) {
      this.selectedDateStr = todayStr;
      console.log('🎯 Auto-selected today:', todayStr, 'with', availableCount, 'slots');
      this.dateSelected.emit({
        date: today,
        dateId: todayStr,
        availableCount: availableCount
      });
    } else {
      console.log('⚠️ Today (', todayStr, ') is not available or fully booked (', availableCount, 'slots)');
      console.log('💡 You may need to re-run the seed script: npx tsx scripts/seed-slots.ts');
      
      // Try to find the next available date
      const nextAvailable = this.findNextAvailableDate(today);
      if (nextAvailable) {
        console.log('✨ Auto-selecting next available date:', nextAvailable.dateId);
        this.selectedDateStr = nextAvailable.dateId;
        this.dateSelected.emit({
          date: new Date(nextAvailable.dateId),
          dateId: nextAvailable.dateId,
          availableCount: nextAvailable.availableCount
        });
      }
    }
  }

  private findNextAvailableDate(startDate: Date): { dateId: string; availableCount: number } | null {
    const dates = Array.from(this.dateAvailability.entries())
      .map(([dateId, doc]) => ({
        dateId,
        date: new Date(dateId),
        availableCount: doc.availableTimeIds?.length ?? 0
      }))
      .filter(d => d.date >= startDate && d.availableCount > 0)
      .sort((a, b) => a.date.getTime() - b.date.getTime());
    
    return dates.length > 0 ? dates[0] : null;
  }

  private async loadDateAvailability() {
    try {
      console.log('🔄 Loading date availability from Firestore...');
      const dates = await this.appointmentsService.getAllDates();
      console.log('📊 Loaded dates:', dates.length);
      
      dates.forEach(dateDoc => {
        this.dateAvailability.set(dateDoc.dateId, dateDoc);
      });
      
      console.log('📋 Date availability map size:', this.dateAvailability.size);
      console.log('📋 Sample dates:', Array.from(this.dateAvailability.keys()).slice(0, 5));
      
      // Update calendar with availability indicators
      this.updateCalendarEvents();
    } catch (error) {
      console.error('❌ Error loading date availability:', error);
    }
  }

  private updateCalendarEvents() {
    const events: EventInput[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    this.dateAvailability.forEach((dateDoc) => {
      const dateObj = new Date(dateDoc.date);
      const isPast = dateObj < today;
      const availableCount = dateDoc.availableTimeIds?.length ?? 0; // Safe access with fallback

      if (!isPast) {
        if (availableCount === 0) {
          // Fully booked
          events.push({
            start: dateDoc.date,
            display: 'background',
            backgroundColor: '#fee2e2', // Light red
            classNames: ['fully-booked']
          });
        }
        // Removed low availability indicator (was yellow for 1-3 slots)
      }
    });

    this.calendarOptions = {
      ...this.calendarOptions,
      events
    };
  }

  calendarOptions: CalendarOptions = {
    initialView: 'dayGridMonth',
    plugins: [dayGridPlugin, interactionPlugin],
    dateClick: this.handleDateClick.bind(this),
    selectable: true,
    selectMirror: true,
    headerToolbar: {
      left: 'prev',
      center: 'title',
      right: 'next'
    },
    height: 'auto',
    aspectRatio: 1.35,
    timeZone: 'local', // Force local timezone
    validRange: {
      start: new Date() // Prevent selecting past dates
    },
    dayCellClassNames: (arg) => {
      // FIX: Use local date components to avoid UTC offset issues
      const cellDate = new Date(arg.date);
      const year = cellDate.getFullYear();
      const month = cellDate.getMonth() + 1;
      const day = cellDate.getDate();
      const dateStr = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const localCellDate = new Date(year, month - 1, day, 0, 0, 0, 0);
      
      const classes = [];
      
      // Past dates
      if (localCellDate < today) {
        classes.push('past-date');
      }
      
      // Check availability
      const dateDoc = this.dateAvailability.get(dateStr);
      if (dateDoc) {
        const availableCount = dateDoc.availableTimeIds?.length ?? 0;
        if (availableCount === 0 && localCellDate >= today) {
          classes.push('fully-booked-date');
        }
      }

      // Selected date
      if (this.selectedDateStr === dateStr) {
        classes.push('selected-date');
      }
      
      return classes;
    },
    dayCellDidMount: (arg) => {
      // FIX: Use local date components to avoid UTC offset issues
      const cellDate = new Date(arg.date);
      const year = cellDate.getFullYear();
      const month = cellDate.getMonth() + 1;
      const day = cellDate.getDate();
      const dateStr = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const localCellDate = new Date(year, month - 1, day, 0, 0, 0, 0);
      
      const dateDoc = this.dateAvailability.get(dateStr);
      const isPast = localCellDate < today;
      const availableCount = dateDoc?.availableTimeIds?.length ?? 0;
      const isFullyBooked = dateDoc && availableCount === 0;
      
      // Make dates clickable (remove pointer-events: none)
      if (isPast || isFullyBooked) {
        arg.el.style.cursor = 'not-allowed';
      } else {
        arg.el.style.cursor = 'pointer';
      }
    }
  };

  handleDateClick(arg: any) {
    console.log('\n🖱️ ========== DATE CLICK DEBUG ==========');
    console.log('🖱️ RAW arg object:', arg);
    console.log('🖱️ arg.dateStr (YYYY-MM-DD):', arg.dateStr);
    console.log('🖱️ arg.date (Date object):', arg.date);
    console.log('🖱️ arg.date.toISOString():', arg.date.toISOString());
    console.log('🖱️ arg.dayEl.innerText (visual day):', arg.dayEl?.innerText);
    
    // FIX: Use arg.date and format it in local timezone to avoid UTC offset issues
    const clickedDate = new Date(arg.date);
    const year = clickedDate.getFullYear();
    const month = clickedDate.getMonth() + 1; // getMonth is 0-indexed
    const day = clickedDate.getDate();
    
    // Create the dateStr in YYYY-MM-DD format using LOCAL date components
    const dateStr = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    
    console.log('📋 Calculated dateStr from local date:', dateStr);
    console.log('📋 Original arg.dateStr:', arg.dateStr);
    
    // Create a clean date object for this day at midnight local time
    const localDate = new Date(year, month - 1, day, 0, 0, 0, 0);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    console.log('📅 Local date:', localDate.toDateString());
    console.log('📅 Date components -> Day:', day, 'Month:', month, 'Year:', year);
    console.log('📅 Today:', today.toDateString());
    console.log('📅 Selected dateStr (ID):', dateStr);
    console.log('📅 Previous selectedDateStr:', this.selectedDateStr);
    
    // Prevent selecting past dates
    if (localDate < today) {
      console.log('❌ Date is in the past, cannot select');
      return;
    }

    const dateDoc = this.dateAvailability.get(dateStr);
    console.log('📄 Date document:', dateDoc);
    
    const availableCount = dateDoc?.availableTimeIds?.length ?? 0;
    
    // Prevent selecting fully booked dates
    if (!dateDoc || availableCount === 0) {
      console.log('❌ Date is fully booked or not available');
      return;
    }

    // Update selected date
    const previousSelection = this.selectedDateStr;
    this.selectedDateStr = dateStr;
    console.log('✅ Date selected successfully!');
    console.log('   → Changed from:', previousSelection || 'none', 'to:', dateStr);
    console.log('   → Available slots:', availableCount);
    console.log('   → Will highlight date:', dateStr);
    
    this.updateCalendarEvents(); // Refresh to show selection
    
    const event = {
      date: localDate,
      dateId: dateStr,
      availableCount: availableCount
    };
    
    console.log('📤 Emitting dateSelected event to parent:');
    console.log('   → dateId:', event.dateId);
    console.log('   → date:', event.date.toDateString());
    console.log('   → availableCount:', event.availableCount);
    console.log('========================================\n');
    this.dateSelected.emit(event);
  }
}
