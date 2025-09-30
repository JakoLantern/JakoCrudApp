import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LoginCard } from './components/login-card/login-card';

@Component({
  selector: 'app-login',
  imports: [RouterLink, LoginCard],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {

}
