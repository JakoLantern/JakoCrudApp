import { Component, Output, EventEmitter, ViewChild } from '@angular/core';
import { FullCalendarComponent } from '@fullcalendar/angular';
import { CalendarComponent } from '../calendar/calendar';

@Component({
  selector: 'date-selector',
  imports: [CalendarComponent],
  templateUrl: './date-selector.html',
  styleUrl: './date-selector.scss'
})
export class DateSelector {
  @Output() dateSelected = new EventEmitter<Date>();
  selectedDate: Date | null = null;
  @ViewChild('calendar') calendar!: FullCalendarComponent;

  onDateSelected(date: Date) {
    this.selectedDate = date;
    this.dateSelected.emit(this.selectedDate);
  }

  goToToday() {
    this.calendar.getApi().today();
  }
}
