import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../services/auth.service';
import { SuccessModalComponent } from '../../../../shared/success-modal/success-modal';
import { ErrorModalComponent } from '../../../../shared/error-modal/error-modal';

@Component({
  selector: 'register-card',
  imports: [RouterLink, ReactiveFormsModule, CommonModule, SuccessModalComponent, ErrorModalComponent],
  templateUrl: './register-card.html',
  styleUrl: './register-card.scss'
})
export class RegisterCard implements OnInit {
  registerForm!: FormGroup;
  loading = false;
  errorMessage: string = '';
  showSuccessModal = false;
  successMessage = '';
  showErrorModal = false;
  errorModalMessage = '';
  errorModalTitle = 'Error';
  
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  constructor(
    private readonly formBuilder: FormBuilder,
    private router: Router
  ) {}

  ngOnInit() {
    this.registerForm = this.formBuilder.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  // Custom validator to check if passwords match (UI validation)
  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    
    if (!password || !confirmPassword) {
      return null;
    }
    
    return password.value === confirmPassword.value ? null : { passwordMismatch: true };
  }

  onSuccessProceed(): void {
    console.log('🚀 onSuccessProceed called - hiding modal and navigating');
    this.showSuccessModal = false;
    this.router.navigate(['/login']);
  }

  async onRegister(): Promise<void> {
    this.errorMessage = '';
    
    // UI validation - check if form is valid
    if (this.registerForm.invalid) {
      this.errorMessage = 'Please fill in all required fields correctly.';
      return;
    }

    try {
      this.loading = true;
      const { firstName, lastName, email, password } = this.registerForm.value;
      
      console.log('📝 Starting registration for:', email);
      
      // Call AuthService to handle all Firebase and Firestore logic
      const { user, profile } = await this.authService.register({
        firstName,
        lastName,
        email,
        password
      });
      
      console.log('✅ Registration successful!');
      console.log('   User ID:', user.uid);
      console.log('   Email:', user.email);
      console.log('   Profile created:', profile);
      
      // Success! Show modal (UI logic)
      this.successMessage = 'Your account has been created successfully! You can now login with your credentials.';
      this.showSuccessModal = true;
      // Manually trigger change detection to show modal immediately
      this.cdr.detectChanges();
      
    } catch (error: any) {
      console.error('❌ Registration failed:', error);
      
      // Show error modal with user-friendly messages (UI logic)
      this.errorModalTitle = 'Registration Failed';
      
      if (error.code === 'auth/email-already-in-use') {
        this.errorModalMessage = 'This email is already registered. Please login instead or use a different email.';
      } else if (error.code === 'auth/weak-password') {
        this.errorModalMessage = 'Password is too weak. Please use at least 6 characters.';
      } else if (error.code === 'auth/invalid-email') {
        this.errorModalMessage = 'Invalid email address format. Please check and try again.';
      } else if (error.code === 'auth/network-request-failed') {
        this.errorModalMessage = 'Network error. Please check your internet connection and try again.';
      } else {
        this.errorModalMessage = error.message || 'Registration failed. Please try again.';
      }
      
      this.showErrorModal = true;
      this.cdr.detectChanges();
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  onErrorClose(): void {
    console.log('❌ Error modal closed');
    this.showErrorModal = false;
  }
}
