import { Component, Output, EventEmitter, Input, OnChanges, SimpleChanges, inject, ChangeDetectorRef } from '@angular/core';
import { TimeSlots } from '../../../../shared/time-slots/time-slots';
import { AppointmentsService, TimeDoc } from '../../../../services/appointments.service';
import { CommonModule } from '@angular/common';
import { TimeSelectedEvent } from '../../../../models/booking.types';

@Component({
  selector: 'time-selector',
  imports: [TimeSlots, CommonModule],
  templateUrl: './time-selector.html',
  styleUrl: './time-selector.scss'
})
export class TimeSelector implements OnChanges {
  @Input() selectedDateId: string | null = null;
  @Output() timeSelected = new EventEmitter<TimeSelectedEvent | null>();
  
  private appointmentsService = inject(AppointmentsService);
  private cdr = inject(ChangeDetectorRef);
  
  selectedTime: string | null = null;
  availableTimes: string[] = [];
  allTimeSlots: string[] = [];
  disabledSlots: string[] = [];
  loading = false;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['selectedDateId']) {
      if (this.selectedDateId) {
        // Defer loading to avoid ExpressionChangedAfterItHasBeenCheckedError
        setTimeout(() => this.loadAvailableTimes(), 0);
      } else {
        // No date selected, disable all times
        this.availableTimes = [];
        this.allTimeSlots = [];
        this.disabledSlots = [];
        this.selectedTime = null;
        // Defer emission to avoid change detection error
        setTimeout(() => this.timeSelected.emit(null), 0);
      }
    }
  }

  private async loadAvailableTimes() {
    if (!this.selectedDateId) {
      return;
    }
    
    this.loading = true;
    
    try {
      // OPTIMIZATION: Fetch both in parallel instead of sequentially
      const [allTimes, dateData] = await Promise.all([
        this.appointmentsService.getAllTimes(),
        this.appointmentsService.getDateAvailability(this.selectedDateId)
      ]);
      
      this.allTimeSlots = allTimes.map(t => t.time);
      
      // Get available time IDs from the date document
      const availableTimeIds = dateData?.availableTimeIds || [];
      
      // Map time IDs to time strings
      const timeIdToTimeMap = new Map(allTimes.map(t => [t.timeId, t.time]));
      this.availableTimes = availableTimeIds
        .map(id => timeIdToTimeMap.get(id))
        .filter(time => time !== undefined) as string[];
      
      // Disabled slots are all slots not in available times
      this.disabledSlots = this.allTimeSlots.filter(t => !this.availableTimes.includes(t));
      
      // Reset selection if current selection is not available
      if (this.selectedTime && this.disabledSlots.includes(this.selectedTime)) {
        this.selectedTime = null;
        // Defer emission to avoid change detection error
        setTimeout(() => this.timeSelected.emit(null), 0);
      }
    } catch (error) {
      console.error('Error loading available times:', error);
    } finally {
      this.loading = false;
    }
  }

  onTimeSelected(time: string | null): void {
    if (!time || !this.selectedDateId) {
      this.selectedTime = null;
      this.timeSelected.emit(null);
      return;
    }

    this.selectedTime = time;
    
    // Find the timeId for this time
    const timeId = this.createTimeId(time);
    this.timeSelected.emit({ time, timeId });
  }

  private createTimeId(time: string): string {
    // Convert "8:00 AM" to "08-00_AM"
    return time.replace(/:/g, '-').replace(/ /g, '_');
  }
}
