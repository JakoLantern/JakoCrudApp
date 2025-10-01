import { Injectable, inject } from '@angular/core';
import { FirebaseService } from '../firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  User,
  onAuthStateChanged
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
  private currentUser$ = new BehaviorSubject<User | null>(null);
  private authInitialized$ = new BehaviorSubject<boolean>(false);

  constructor() {
    // Listen to auth state changes
    const auth = this.firebase.getAuth();
    onAuthStateChanged(auth, (user) => {
      console.log('🔐 AuthService: Auth state changed, user:', user?.uid || 'null');
      this.currentUser$.next(user);
      if (!this.authInitialized$.value) {
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
   */
  async waitForAuthInit(): Promise<User | null> {
    if (this.authInitialized$.value) {
      return this.currentUser$.value;
    }
    
    return new Promise((resolve) => {
      const subscription = this.authInitialized$.subscribe((initialized) => {
        if (initialized) {
          subscription.unsubscribe();
          resolve(this.currentUser$.value);
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

  async signOut(): Promise<void> {
    const auth = this.firebase.getAuth();
    await firebaseSignOut(auth);
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
}
