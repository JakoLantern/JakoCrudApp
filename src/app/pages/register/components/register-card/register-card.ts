import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../../../services/supabase.service';
import { Router } from '@angular/router';

@Component({
  selector: 'register-card',
  imports: [RouterLink, FormsModule],
  templateUrl: './register-card.html',
  styleUrl: './register-card.scss'
})
export class RegisterCard {
  firstName: string = '';
  lastName: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';

  constructor(private supabaseService: SupabaseService, private router: Router) {}

  async onRegister() {
    try {
      const { data, error } = await this.supabaseService.register(this.firstName, this.lastName, this.email, this.password, this.confirmPassword);
      if (error) {
        alert('Registration failed: ' + error.message);
      } else {
        // Create user profile in USER table
        if (data.user) {
          await this.supabaseService.createUserProfile(data.user.id, this.firstName, this.lastName, this.email);
        }
        alert('Registration successful! Please check your email to confirm.');
        this.router.navigate(['/login']);
      }
    } catch (error) {
      console.error('Registration error:', error);
      alert('Registration error: ' + (error as Error).message);
    }
  }
}
