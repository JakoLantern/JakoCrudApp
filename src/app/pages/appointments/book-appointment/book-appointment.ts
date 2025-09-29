import { Component } from '@angular/core';
import { DateSelector } from '../components/date-selector/date-selector';
import { TimeSelector } from '../components/time-selector/time-selector';
import { DatePipe } from '@angular/common';
import { BackButton } from '../../../shared/back-button/back-button';
import { AppointmentSummary } from '../components/appointment-summary/appointment-summary';

@Component({
  selector: 'app-book-appointment',
  imports: [DateSelector, TimeSelector, DatePipe, BackButton, AppointmentSummary],
  templateUrl: './book-appointment.html',
  styleUrl: './book-appointment.scss'
})
export class BookAppointment {
  selectedDate: Date | null = null;
  selectedTime: string | null = null;

  onDateSelected(date: Date) {
    this.selectedDate = date;
  }

  onTimeSelected(time: string | null) {
    this.selectedTime = time;
  }

  canProceed(): boolean {
    return this.selectedDate !== null && this.selectedTime !== null;
  }

  bookAppointment() {
    if (this.canProceed()) {
      // TODO: Implement booking logic
      alert(`Appointment booked for ${this.selectedDate?.toDateString()} at ${this.selectedTime}`);
    }
  }
}
