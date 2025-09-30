import { Component } from '@angular/core';
import { BackButton } from '../../../shared/back-button/back-button';
import { BookingTable } from '../components/booking-table/booking-table';
import { FullAppointmentView } from '../components/full-appointment-view/full-appointment-view';

@Component({
  selector: 'app-view-appointment',
  imports: [BackButton, BookingTable, FullAppointmentView],
  templateUrl: './view-appointment.html',
  styleUrl: './view-appointment.scss'
})
export class ViewAppointment {

}
