import { Component } from '@angular/core';
import { Navbar } from '../../../shared/navbar/navbar';
import { DateSelector } from '../components/date-selector/date-selector';
import { TimeSelector } from '../components/time-selector/time-selector';
import { NgIf, DatePipe } from '@angular/common';

@Component({
  selector: 'app-book-appointment',
  imports: [Navbar, DateSelector, TimeSelector, NgIf, DatePipe],
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
