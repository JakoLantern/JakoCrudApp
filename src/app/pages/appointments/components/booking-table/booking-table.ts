import { Component, ViewChild, AfterViewInit, OnInit, OnDestroy, inject, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { TitleCasePipe } from '@angular/common';
import { AppointmentsService, Appointment } from '../../../../services/appointments.service';
import { Router, NavigationEnd } from '@angular/router';
import { filter, Subject, takeUntil } from 'rxjs';
import { ConfirmationModalComponent } from '../../../../shared/confirmation-modal/confirmation-modal';
import { SuccessModalComponent } from '../../../../shared/success-modal/success-modal';
import { ErrorModalComponent } from '../../../../shared/error-modal/error-modal';

@Component({
  selector: 'booking-table',
  imports: [MatTableModule, MatPaginatorModule, TitleCasePipe, ConfirmationModalComponent, SuccessModalComponent, ErrorModalComponent],
  templateUrl: './booking-table.html',
  styleUrl: './booking-table.scss'
})
export class BookingTable implements OnInit, AfterViewInit, OnDestroy {
  private appointmentsService = inject(AppointmentsService);
  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router);
  private destroy$ = new Subject<void>();

  displayedColumns: string[] = ['date', 'time', 'status', 'actions'];
  dataSource = new MatTableDataSource<Appointment>([]);
  loading = true;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @Output() appointmentSelected = new EventEmitter<Appointment>();

  // Modal states
  showConfirmationModal = false;
  showSuccessModal = false;
  showErrorModal = false;
  
  // Modal messages
  confirmationTitle = '';
  confirmationMessage = '';
  successMessage = '';
  errorMessage = '';
  
  // Appointment being cancelled
  appointmentToCancel: Appointment | null = null;

  ngOnInit() {
    console.log('🎬 BookingTable: ngOnInit called');
    this.loadAppointments();
    
    // Reload appointments when navigating back to this page
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe((event) => {
        console.log('🧭 BookingTable: Navigation detected:', event);
        if ((event as NavigationEnd).url.includes('view-appointment')) {
          console.log('🔄 BookingTable: Reloading appointments due to navigation');
          this.loadAppointments();
        }
      });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadAppointments() {
    console.log('🔄 BookingTable: loadAppointments started');
    this.loading = true;
    console.log('⏳ BookingTable: Loading set to true');
    this.cdr.markForCheck();
    
    this.appointmentsService.getUserAppointments().then(appointments => {
      console.log('📬 BookingTable: Received appointments:', appointments);
      console.log('📊 BookingTable: Appointments count:', appointments.length);
      
      // Filter for upcoming appointments (today and future)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayStr = today.toISOString().split('T')[0];
      console.log('📅 BookingTable: Today\'s date (for filtering):', todayStr);
      
      const upcomingAppointments = appointments.filter(apt => {
        const isUpcoming = apt.date >= todayStr;
        console.log(`🗓️ BookingTable: Appointment ${apt.appointmentId} (${apt.date}) - Upcoming: ${isUpcoming}`);
        return isUpcoming;
      });
      
      console.log('🎯 BookingTable: Upcoming appointments:', upcomingAppointments);
      console.log('📊 BookingTable: Upcoming count:', upcomingAppointments.length);
      
      // Update data source and loading state
      this.dataSource.data = upcomingAppointments;
      this.loading = false;
      console.log('✅ BookingTable: DataSource updated with', this.dataSource.data.length, 'appointments');
      console.log('🏁 BookingTable: Loading set to false');
      
      // Explicitly trigger change detection
      this.cdr.detectChanges();
      console.log('🔔 BookingTable: Change detection triggered');
    }).catch(error => {
      console.error('❌ BookingTable: Error loading appointments:', error);
      this.loading = false;
      console.log('🚫 BookingTable: Loading set to false (error)');
      this.cdr.detectChanges();
    });
  }

  cancelAppointment(appointment: Appointment) {
    // Show confirmation modal
    this.appointmentToCancel = appointment;
    this.confirmationTitle = 'Cancel Appointment?';
    this.confirmationMessage = `Are you sure you want to cancel your appointment on ${appointment.date} at ${appointment.time}?\n\nThis action cannot be undone.`;
    this.showConfirmationModal = true;
    this.cdr.detectChanges();
  }

  onConfirmCancel() {
    if (!this.appointmentToCancel) return;
    
    // Hide confirmation modal
    this.showConfirmationModal = false;
    this.cdr.detectChanges();
    
    // Perform cancellation
    this.appointmentsService.cancelAppointment(this.appointmentToCancel.appointmentId).then(result => {
      if (result.success) {
        // Show success modal
        this.successMessage = `Your appointment on ${this.appointmentToCancel!.date} at ${this.appointmentToCancel!.time} has been cancelled successfully.`;
        this.showSuccessModal = true;
        this.cdr.detectChanges();
        
        // Reload appointments
        this.loadAppointments();
      } else {
        // Show error modal
        this.errorMessage = result.error || 'Failed to cancel appointment. Please try again.';
        this.showErrorModal = true;
        this.cdr.detectChanges();
      }
      
      // Clear appointment reference
      this.appointmentToCancel = null;
    }).catch(error => {
      console.error('Error cancelling appointment:', error);
      
      // Show error modal
      this.errorMessage = 'Failed to cancel appointment. Please try again.';
      this.showErrorModal = true;
      this.cdr.detectChanges();
      
      // Clear appointment reference
      this.appointmentToCancel = null;
    });
  }

  onCancelCancel() {
    // User clicked cancel, just close the modal
    this.showConfirmationModal = false;
    this.appointmentToCancel = null;
    this.cdr.detectChanges();
  }

  onSuccessModalClose() {
    this.showSuccessModal = false;
    this.cdr.detectChanges();
  }

  onErrorModalClose() {
    this.showErrorModal = false;
    this.cdr.detectChanges();
  }

  onRowClick(appointment: Appointment) {
    this.appointmentSelected.emit(appointment);
  }
}
