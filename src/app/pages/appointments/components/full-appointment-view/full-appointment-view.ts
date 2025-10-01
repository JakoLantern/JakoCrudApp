import { Component, Input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Appointment } from '../../../../services/appointments.service';

@Component({
  selector: 'full-appointment-view',
  imports: [DatePipe],
  templateUrl: './full-appointment-view.html',
  styleUrl: './full-appointment-view.scss'
})
export class FullAppointmentView {
  @Input() appointment: Appointment | null = null;
}
