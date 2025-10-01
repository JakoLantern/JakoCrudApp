import { Component } from '@angular/core';
import { LoginCard } from './components/login-card/login-card';

@Component({
  selector: 'app-login',
  imports: [LoginCard],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {

}
