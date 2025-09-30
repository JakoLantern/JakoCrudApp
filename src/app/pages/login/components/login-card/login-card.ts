import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../../../services/supabase.service';
import { Router } from '@angular/router';

@Component({
  selector: 'login-card',
  imports: [RouterLink, FormsModule],
  templateUrl: './login-card.html',
  styleUrl: './login-card.scss'
})
export class LoginCard {
  email: string = '';
  password: string = '';

  constructor(private supabaseService: SupabaseService, private router: Router) {}

  async onLogin() {
    try {
      const { data, error } = await this.supabaseService.signIn(this.email, this.password);
      if (error) {
        alert('Login failed: ' + error.message);
      } else {
        alert('Login successful!');
        this.router.navigate(['/dashboard']);
      }
    } catch (error) {
      console.error('Login error:', error);
    }
  }
}
