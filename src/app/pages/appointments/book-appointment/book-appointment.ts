import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { DateSelector } from '../components/date-selector/date-selector';
import { TimeSelector } from '../components/time-selector/time-selector';
import { DatePipe } from '@angular/common';
import { BackButton } from '../../../shared/back-button/back-button';
import { AppointmentSummary } from '../components/appointment-summary/appointment-summary';
import { AppointmentsService } from '../../../services/appointments.service';
import { Router, ActivatedRoute } from '@angular/router';
import { DateSelectedEvent, TimeSelectedEvent } from '../../../models/booking.types';
import { SuccessModalComponent } from '../../../shared/success-modal/success-modal';
import { ErrorModalComponent } from '../../../shared/error-modal/error-modal';

@Component({
  selector: 'app-book-appointment',
  imports: [DateSelector, TimeSelector, BackButton, AppointmentSummary, SuccessModalComponent, ErrorModalComponent],
  templateUrl: './book-appointment.html',
  styleUrl: './book-appointment.scss'
})
export class BookAppointment implements OnInit {
  private appointmentsService = inject(AppointmentsService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);

  selectedDate: Date | null = null;
  selectedDateId: string | null = null;
  selectedTime: string | null = null;
  selectedTimeId: string | null = null;
  isBooking = false;
  
  // Modal states
  showSuccessModal = false;
  showErrorModal = false;
  successMessage = '';
  errorMessage = '';

  ngOnInit() {
    // Data is pre-fetched by resolvers for SSR
  }

  onDateSelected(event: DateSelectedEvent): void {
    this.selectedDate = event.date;
    this.selectedDateId = event.dateId;
    
    // Reset time selection when date changes
    this.selectedTime = null;
    this.selectedTimeId = null;
  }

  onTimeSelected(event: TimeSelectedEvent | null): void {
    if (event) {
      this.selectedTime = event.time;
      this.selectedTimeId = event.timeId;
    } else {
      this.selectedTime = null;
      this.selectedTimeId = null;
    }
  }

  canProceed(): boolean {
    return this.selectedDate !== null && 
           this.selectedDateId !== null && 
           this.selectedTime !== null && 
           this.selectedTimeId !== null;
  }

  async bookAppointment() {
    if (!this.canProceed() || this.isBooking) {
      return;
    }

    this.isBooking = true;

    try {
      const result = await this.appointmentsService.bookAppointment(
        this.selectedDateId!,
        this.selectedTimeId!
      );

      if (result.success) {
        // Show success modal
        this.successMessage = `Your appointment has been successfully booked!\n\nDate: ${this.selectedDate?.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}\nTime: ${this.selectedTime}`;
        this.showSuccessModal = true;
        // Manually trigger change detection to show modal immediately
        this.cdr.detectChanges();
      } else {
        // Show error modal
        this.errorMessage = result.error || 'Unable to book appointment. Please try again.';
        this.showErrorModal = true;
        this.cdr.detectChanges();
      }
    } catch (error) {
      console.error('Error booking appointment:', error);
      this.errorMessage = 'An unexpected error occurred. Please try again later.';
      this.showErrorModal = true;
      this.cdr.detectChanges();
    } finally {
      this.isBooking = false;
      this.cdr.detectChanges();
    }
  }
  
  onSuccessModalProceed() {
    this.showSuccessModal = false;
    // Navigate to appointments list
    this.router.navigate(['/appointments']);
  }
  
  onErrorModalClose() {
    this.showErrorModal = false;
  }
}
