import { Component, ViewChild, AfterViewInit, OnInit, OnDestroy, inject, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { TitleCasePipe } from '@angular/common';
import { AppointmentsService, Appointment } from '../../../../services/appointments.service';
import { Router, NavigationEnd } from '@angular/router';
import { filter, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'booking-table',
  imports: [MatTableModule, MatPaginatorModule, TitleCasePipe],
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
    if (confirm(`Are you sure you want to cancel your appointment on ${appointment.date} at ${appointment.time}?`)) {
      this.appointmentsService.cancelAppointment(appointment.appointmentId).then(result => {
        if (result.success) {
          // Reload appointments after successful cancellation
          this.loadAppointments();
          alert('Appointment cancelled successfully.');
        } else {
          alert(result.error || 'Failed to cancel appointment. Please try again.');
        }
      }).catch(error => {
        console.error('Error cancelling appointment:', error);
        alert('Failed to cancel appointment. Please try again.');
      });
    }
  }

  onRowClick(appointment: Appointment) {
    this.appointmentSelected.emit(appointment);
  }
}
