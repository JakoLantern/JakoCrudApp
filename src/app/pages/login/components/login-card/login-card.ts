import { Component, OnInit, inject } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'login-card',
  imports: [RouterLink, ReactiveFormsModule, CommonModule],
  templateUrl: './login-card.html',
  styleUrl: './login-card.scss'
})
export class LoginCard implements OnInit {
  loginForm!: FormGroup;
  loading = false;
  errorMessage: string = '';
  
  private authService = inject(AuthService);

  constructor(
    private readonly formBuilder: FormBuilder,
    private router: Router
  ) {}

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  async onLogin(): Promise<void> {
    this.errorMessage = '';
    
    // UI validation - check if form is valid
    if (this.loginForm.invalid) {
      this.errorMessage = 'Please fill in all required fields correctly.';
      return;
    }

    try {
      this.loading = true;
      const email = this.loginForm.value.email as string;
      const password = this.loginForm.value.password as string;
      
      console.log('🔐 Attempting login for:', email);
      
      // Call AuthService to handle all Firebase logic
      const user = await this.authService.login({ email, password });
      
      console.log('✅ Login successful!');
      console.log('   User ID:', user.uid);
      console.log('   Email:', user.email);
      
      // Navigate to dashboard on success
      this.router.navigate(['/dashboard']);
      
    } catch (error: any) {
      console.error('❌ Login failed:', error);
      
      // User-friendly error messages (UI logic)
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
        this.errorMessage = 'Invalid email or password. Please try again.';
      } else if (error.code === 'auth/user-not-found') {
        this.errorMessage = 'No account found with this email. Please register first.';
      } else if (error.code === 'auth/too-many-requests') {
        this.errorMessage = 'Too many failed attempts. Please try again later.';
      } else if (error.code === 'auth/network-request-failed') {
        this.errorMessage = 'Network error. Please check your internet connection.';
      } else {
        this.errorMessage = error.message || 'Login failed. Please try again.';
      }
    } finally {
      this.loading = false;
    }
  }
}
