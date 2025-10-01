import { Injectable, InjectionToken } from '@angular/core';
import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAnalytics, Analytics } from 'firebase/analytics';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAn5LHoaaOd7bQLNLaJ9mww_FxA3DNvY8A",
  authDomain: "jakocrudapp.firebaseapp.com",
  projectId: "jakocrudapp",
  storageBucket: "jakocrudapp.firebasestorage.app",
  messagingSenderId: "306042422243",
  appId: "1:306042422243:web:0e3b6c98147322575916d6",
  measurementId: "G-DHYX8YE8DD"
};

// Injection tokens for Firebase services
export const FIREBASE_APP = new InjectionToken<FirebaseApp>('firebase.app');
export const FIREBASE_AUTH = new InjectionToken<Auth>('firebase.auth');
export const FIREBASE_FIRESTORE = new InjectionToken<Firestore>('firebase.firestore');
export const FIREBASE_ANALYTICS = new InjectionToken<Analytics>('firebase.analytics');

@Injectable({
  providedIn: 'root',
})
export class FirebaseService {
  private app: FirebaseApp;
  private auth: Auth;
  private firestore: Firestore;
  private analytics: Analytics | null = null;

  constructor() {
    // Initialize Firebase
    this.app = initializeApp(firebaseConfig);
    this.auth = getAuth(this.app);
    this.firestore = getFirestore(this.app);
    
    // Initialize Analytics (only in browser, not in SSR)
    if (typeof window !== 'undefined') {
      this.analytics = getAnalytics(this.app);
    }
  }

  // Getters for Firebase instances
  getApp(): FirebaseApp {
    return this.app;
  }

  getAuth(): Auth {
    return this.auth;
  }

  getFirestore(): Firestore {
    return this.firestore;
  }

  getAnalytics(): Analytics | null {
    return this.analytics;
  }
}

// For backward compatibility - export as Firebase
export { FirebaseService as Firebase };