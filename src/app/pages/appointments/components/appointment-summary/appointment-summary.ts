import { Component, Input, Output, EventEmitter } from '@angular/core';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'appointment-summary',
  imports: [DatePipe],
  templateUrl: './appointment-summary.html',
  styleUrl: './appointment-summary.scss'
})
export class AppointmentSummary {

  @Input() selectedDate: Date | null = null;
  @Input() selectedTime: string | null = null;
  @Input() isBooking = false;
  @Output() book = new EventEmitter<void>();

  canProceed(): boolean {
    return !!(this.selectedDate && this.selectedTime) && !this.isBooking;
  }

  onBookAppointment() {
    if (this.canProceed()) {
      this.book.emit();
    }
  }

}
