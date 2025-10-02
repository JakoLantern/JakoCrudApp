import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Auth Guard - Protects routes that require authentication
 * Redirects to login if user is not authenticated
 * Waits for Firebase Auth to initialize before making decision
 */
export const authGuard: CanActivateFn = async () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  console.log('🔐 Auth Guard: START - Executing guard...');
  console.log('🔐 Auth Guard: AuthService instance:', authService ? 'Found' : 'NULL');
  
  try {
    console.log('🔐 Auth Guard: Calling waitForAuthInit(5000)...');
    
    // Wait for auth to initialize (max 5 seconds)
    const user = await authService.waitForAuthInit(5000);
    
    console.log('🔐 Auth Guard: waitForAuthInit returned:', {
      hasUser: !!user,
      email: user?.email || 'null',
      uid: user?.uid || 'null'
    });
    
    if (user) {
      console.log('✅ Auth Guard: User authenticated, access granted', {
        email: user.email,
        uid: user.uid
      });
      return true;
    } else {
      console.log('⛔ Auth Guard: No user found, redirecting to login');
      router.navigate(['/login']);
      return false;
    }
  } catch (error) {
    console.error('❌ Auth Guard: Error during auth check', error);
    router.navigate(['/login']);
    return false;
  }
};

/**
 * Guest Guard - Redirects authenticated users away from login/register pages
 * Useful for login and register pages
 * Waits for Firebase Auth to initialize before making decision
 */
export const guestGuard: CanActivateFn = async () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  console.log('🔓 Guest Guard: Executing, waiting for auth initialization...');
  
  try {
    // Wait for auth to initialize (max 5 seconds)
    const user = await authService.waitForAuthInit(5000);
    
    if (!user) {
      console.log('✅ Guest Guard: No user, access granted to login/register');
      return true;
    } else {
      console.log('⛔ Guest Guard: User already logged in, redirecting to dashboard', {
        email: user.email,
        uid: user.uid
      });
      router.navigate(['/dashboard']);
      return false;
    }
  } catch (error) {
    console.error('❌ Guest Guard: Error during auth check', error);
    // On error, allow access to login/register (safer default)
    return true;
  }
};
