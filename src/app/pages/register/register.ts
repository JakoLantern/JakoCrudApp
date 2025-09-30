import { Component } from '@angular/core';
import { RegisterCard } from './components/register-card/register-card';

@Component({
  selector: 'app-register',
  imports: [RegisterCard],
  templateUrl: './register.html',
  styleUrl: './register.scss'
})
export class Register {

}
