import { Component, Output, EventEmitter } from '@angular/core';
import { CalendarComponent } from '../calendar/calendar';
import { NgIf, DatePipe } from '@angular/common';

@Component({
  selector: 'date-selector',
  imports: [CalendarComponent, NgIf, DatePipe],
  templateUrl: './date-selector.html',
  styleUrl: './date-selector.scss'
})
export class DateSelector {
  @Output() dateSelected = new EventEmitter<Date>();
  selectedDate: Date | null = null;

  onDateSelected(date: Date) {
    this.selectedDate = date;
    this.dateSelected.emit(this.selectedDate);
  }
}
