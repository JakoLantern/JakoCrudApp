import { Component, Output, EventEmitter, ViewChild } from '@angular/core';
import { FullCalendarComponent } from '@fullcalendar/angular';
import { CalendarComponent } from '../calendar/calendar';
import { DateSelectedEvent } from '../../../../models/booking.types';

@Component({
  selector: 'date-selector',
  imports: [CalendarComponent],
  templateUrl: './date-selector.html',
  styleUrl: './date-selector.scss'
})
export class DateSelector {
  @Output() dateSelected = new EventEmitter<DateSelectedEvent>();
  selectedDate: Date | null = null;
  @ViewChild('calendar') calendar!: FullCalendarComponent;

  onDateSelected(event: DateSelectedEvent): void {
    console.log('📨 DateSelector received event:', event);
    this.selectedDate = event.date;
    console.log('📤 DateSelector emitting event to parent');
    this.dateSelected.emit(event);
  }

  goToToday() {
    this.calendar.getApi().today();
  }
}
