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
  @Output() book = new EventEmitter<void>();

  canProceed(): boolean {
    return !!(this.selectedDate && this.selectedTime);
  }

  onBookAppointment() {
    if (this.canProceed()) {
      this.book.emit();
    }
  }

}
