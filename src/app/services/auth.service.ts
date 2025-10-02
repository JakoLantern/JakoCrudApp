import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FirebaseService } from '../firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  User,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence
} from 'firebase/auth';
import { doc, setDoc, getDoc, Timestamp } from 'firebase/firestore';
import { Observable, BehaviorSubject } from 'rxjs';

export interface UserProfile {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'patient' | 'admin';
  phoneNumber?: string;
  createdAt: any;
  updatedAt: any;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private firebase = inject(FirebaseService);
  private platformId = inject(PLATFORM_ID);
  private currentUser$ = new BehaviorSubject<User | null>(null);
  private authInitialized$ = new BehaviorSubject<boolean>(false);
  private idToken: string | null = null;
  private tokenRefreshInterval: any = null;

  constructor() {
    console.log('🚀 AuthService: Constructor called');
    const auth = this.firebase.getAuth();
    
    // Firebase Auth uses LOCAL persistence by default in browsers
    // This means the session is automatically persisted across page reloads
    // We don't need to call setPersistence() - it's redundant and causes timing issues
    
    console.log('👂 Setting up auth state listener (Firebase will check localStorage automatically)...');
    this.setupAuthListener(auth);
  }

  private setupAuthListener(auth: any) {
    console.log('👂 Setting up auth state listener...');
    console.log('📊 Initial state - authInitialized$:', this.authInitialized$.value);
    console.log('📊 Initial state - currentUser$:', this.currentUser$.value);
    
    onAuthStateChanged(auth, async (user) => {
      console.log('🔐 ============ Auth state changed callback fired ============');
      console.log('🔐 Auth state:', {
        hasUser: !!user,
        uid: user?.uid || 'null',
        email: user?.email || 'null',
        timestamp: new Date().toISOString(),
        authInitializedBefore: this.authInitialized$.value
      });
      
      this.currentUser$.next(user);
      console.log('✅ currentUser$ updated with:', user?.email || 'null');
      
      // Handle token management
      if (user) {
        console.log('👤 User found, managing tokens...');
        await this.refreshIdToken();
        this.startTokenRefreshInterval();
      } else {
        console.log('👻 No user, clearing tokens...');
        this.stopTokenRefreshInterval();
        this.idToken = null;
      }
      
      if (!this.authInitialized$.value) {
        console.log('🚀 Setting authInitialized$ to TRUE');
        this.authInitialized$.next(true);
        console.log('✅ AuthService: Auth initialized');
      }
    });
  }

  /**
   * Observable that emits when auth state changes
   */
  get user$(): Observable<User | null> {
    return this.currentUser$.asObservable();
  }

  /**
   * Wait for Firebase Auth to initialize and return the current user
   * This is crucial for SSR/hydration scenarios
   * Includes timeout to prevent indefinite waiting
   */
  async waitForAuthInit(timeoutMs: number = 5000): Promise<User | null> {
    console.log('⏳ ========== waitForAuthInit CALLED ==========');
    console.log('⏳ Current state check:');
    console.log('   - authInitialized$:', this.authInitialized$.value);
    console.log('   - currentUser$:', this.currentUser$.value?.email || 'null');
    console.log('   - timeout:', timeoutMs, 'ms');
    
    if (this.authInitialized$.value) {
      const user = this.currentUser$.value;
      console.log('✅ Auth ALREADY initialized! Returning immediately:', {
        hasUser: !!user,
        email: user?.email || 'null',
        uid: user?.uid || 'null'
      });
      return user;
    }
    
    console.log('⏰ Auth NOT initialized yet, setting up promise with timeout...');
    
    return new Promise((resolve) => {
      let resolved = false;
      
      // Timeout fallback
      const timeoutId = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          const user = this.currentUser$.value;
          console.warn('⚠️ ========== AUTH TIMEOUT REACHED ==========');
          console.warn('⚠️ Timeout after', timeoutMs, 'ms');
          console.warn('⚠️ authInitialized$:', this.authInitialized$.value);
          console.warn('⚠️ Returning user:', user?.email || 'null');
          subscription.unsubscribe();
          resolve(user);
        }
      }, timeoutMs);
      
      console.log('👂 Subscribing to authInitialized$...');
      const subscription = this.authInitialized$.subscribe((initialized) => {
        console.log('📡 authInitialized$ emitted:', initialized);
        if (initialized && !resolved) {
          resolved = true;
          const user = this.currentUser$.value;
          console.log('✅ ========== AUTH INITIALIZED! ==========');
          console.log('✅ User:', {
            hasUser: !!user,
            email: user?.email || 'null',
            uid: user?.uid || 'null'
          });
          clearTimeout(timeoutId);
          subscription.unsubscribe();
          resolve(user);
        }
      });
    });
  }

  /**
   * Register a new user with Firebase Auth and create profile in Firestore
   */
  async register(data: RegisterData): Promise<{ user: User; profile: UserProfile }> {
    const { firstName, lastName, email, password } = data;
    
    // Step 1: Create Firebase Auth user
    const auth = this.firebase.getAuth();
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Step 2: Update display name in Firebase Auth
    await updateProfile(userCredential.user, {
      displayName: `${firstName} ${lastName}`
    });
    
    // Step 3: Create user profile in Firestore
    const profile: UserProfile = {
      uid: userCredential.user.uid,
      email: email,
      firstName: firstName,
      lastName: lastName,
      role: 'patient',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
    
    const firestore = this.firebase.getFirestore();
    const userDocRef = doc(firestore, 'users', userCredential.user.uid);
    await setDoc(userDocRef, profile);
    
    return { user: userCredential.user, profile };
  }

  async login(data: LoginData): Promise<User> {
    const { email, password } = data;
    const auth = this.firebase.getAuth();
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  }

  /**
   * Sign out the current user
   * Firebase Auth will automatically update the auth state and clear localStorage
   */
  async signOut(): Promise<void> {
    console.log('🔓 AuthService: Signing out...');
    const auth = this.firebase.getAuth();
    
    try {
      await firebaseSignOut(auth);
      console.log('✅ AuthService: Sign out successful');
      // Firebase will automatically:
      // 1. Clear localStorage
      // 2. Trigger onAuthStateChanged with null
      // 3. Update currentUser$ to null
    } catch (error) {
      console.error('❌ AuthService: Sign out error', error);
      throw error;
    }
  }

  async getUserProfile(uid: string): Promise<UserProfile | null> {
    const firestore = this.firebase.getFirestore();
    const userDocRef = doc(firestore, 'users', uid);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      return userDoc.data() as UserProfile;
    }
    return null;
  }

  getCurrentUser(): User | null {
    const auth = this.firebase.getAuth();
    return auth.currentUser;
  }

  /**
   * Get the current ID token for the authenticated user
   * Useful for making authenticated API calls
   */
  async getIdToken(forceRefresh: boolean = false): Promise<string | null> {
    const user = this.getCurrentUser();
    if (!user) {
      console.warn('⚠️ No authenticated user, cannot get ID token');
      return null;
    }

    try {
      const token = await user.getIdToken(forceRefresh);
      this.idToken = token;
      console.log('✅ ID Token retrieved', forceRefresh ? '(forced refresh)' : '(from cache)');
      return token;
    } catch (error) {
      console.error('❌ Error getting ID token:', error);
      return null;
    }
  }

  /**
   * Refresh the ID token
   * Firebase tokens expire after 1 hour, so we need to refresh them periodically
   */
  private async refreshIdToken(): Promise<void> {
    const token = await this.getIdToken(true);
    if (token) {
      console.log('🔄 ID Token refreshed successfully');
    }
  }

  /**
   * Start automatic token refresh (every 50 minutes)
   * Firebase tokens expire after 1 hour, so we refresh 10 minutes before expiry
   */
  private startTokenRefreshInterval(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return; // Don't run intervals on server
    }

    // Clear any existing interval
    this.stopTokenRefreshInterval();

    // Refresh token every 50 minutes (3000000 ms)
    this.tokenRefreshInterval = setInterval(() => {
      console.log('⏰ Auto-refreshing ID token...');
      this.refreshIdToken();
    }, 50 * 60 * 1000);

    console.log('✅ Token refresh interval started (every 50 minutes)');
  }

  /**
   * Stop the automatic token refresh interval
   */
  private stopTokenRefreshInterval(): void {
    if (this.tokenRefreshInterval) {
      clearInterval(this.tokenRefreshInterval);
      this.tokenRefreshInterval = null;
      console.log('🛑 Token refresh interval stopped');
    }
  }

  /**
   * Get token claims (includes custom claims like role, admin status, etc.)
   */
  async getTokenClaims(): Promise<any> {
    const user = this.getCurrentUser();
    if (!user) {
      return null;
    }

    try {
      const idTokenResult = await user.getIdTokenResult();
      console.log('📋 Token claims retrieved:', idTokenResult.claims);
      return idTokenResult.claims;
    } catch (error) {
      console.error('❌ Error getting token claims:', error);
      return null;
    }
  }

  /**
   * Check if user is admin (from token claims)
   */
  async isAdmin(): Promise<boolean> {
    const claims = await this.getTokenClaims();
    return claims?.admin === true || claims?.role === 'admin';
  }

  /**
   * Set session persistence type BEFORE signing in
   * Call this BEFORE calling login() if you want to change persistence
   * @param type 'local' (persist across browser restarts) or 'session' (clear on browser close)
   * 
   * Example: For "Remember Me" checkbox
   * await authService.setSessionPersistence(rememberMe ? 'local' : 'session');
   * await authService.login({ email, password });
   */
  async setSessionPersistence(type: 'local' | 'session'): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) {
      console.warn('⚠️ Cannot set persistence on server');
      return;
    }

    const auth = this.firebase.getAuth();
    const persistence = type === 'local' ? browserLocalPersistence : browserSessionPersistence;
    
    try {
      await setPersistence(auth, persistence);
      console.log(`✅ Session persistence will be: ${type.toUpperCase()} for next sign-in`);
    } catch (error) {
      console.error('❌ Error setting session persistence:', error);
      throw error;
    }
  }

  /**
   * Clean up resources (call on component destroy if needed)
   */
  ngOnDestroy(): void {
    this.stopTokenRefreshInterval();
  }
}


