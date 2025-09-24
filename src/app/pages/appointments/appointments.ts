import { Component } from '@angular/core';
import { Navbar } from '../../shared/navbar/navbar';
import { SelectorCard } from '../../shared/selector-card/selector-card';

@Component({
  selector: 'app-appointments',
  imports: [Navbar, SelectorCard],
  templateUrl: './appointments.html',
  styleUrl: './appointments.scss'
})
export class Appointments {

}
