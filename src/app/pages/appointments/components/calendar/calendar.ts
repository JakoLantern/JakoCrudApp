import { Component, Output, EventEmitter } from '@angular/core';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions } from '@fullcalendar/core'; 
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.html',
  imports: [FullCalendarModule],
})
export class CalendarComponent {
  @Output() dateSelected = new EventEmitter<Date>();

  calendarOptions: CalendarOptions = {
    initialView: 'dayGridMonth',
    plugins: [dayGridPlugin, interactionPlugin],
    dateClick: this.handleDateClick.bind(this),
    events: [
      { title: 'Doctor Appointment', date: '2025-09-24' },
      { title: 'Meeting with Team', date: '2025-09-25' }
    ],
    selectable: true,
    selectMirror: true,
    // Add theme and styling options here
    themeSystem: 'bootstrap',  // or 'bootstrap' for Bootstrap-like styling
    headerToolbar: {
      left: 'prev',
      center: 'title',
      right: 'next'
    },
    height: 'auto',  // Adjust height
    aspectRatio: 1.35,  // Adjust aspect ratio
    // Custom colors
    eventColor: '#256B55',  // Green for events
    validRange: {
      start: new Date(new Date().getFullYear(), new Date().getMonth(), 1)  // Start from the first day of the current month
    },
  };

  handleDateClick(arg: any) {
    this.dateSelected.emit(new Date(arg.dateStr));
  }
}
