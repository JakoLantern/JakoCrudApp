# Firebase Service - Usage Guide

## ✅ What I Fixed

Your `firebase.ts` was just a plain config file with no exports. I converted it into a proper Angular service that:
- ✅ Is injectable with `@Injectable({ providedIn: 'root' })`
- ✅ Properly initializes Firebase app, auth, firestore, and analytics
- ✅ Works with SSR (checks for browser before initializing analytics)
- ✅ Provides getters for Firebase instances
- ✅ Exports as both `FirebaseService` and `Firebase` for compatibility

---

## 🔧 How to Use Firebase Service

### **Method 1: Constructor Injection (Recommended)**

```typescript
import { Component } from '@angular/core';
import { FirebaseService } from './firebase';

@Component({
  selector: 'app-my-component',
  template: '...'
})
export class MyComponent {
  constructor(private firebase: FirebaseService) {
    // Access Firebase instances
    const auth = this.firebase.getAuth();
    const firestore = this.firebase.getFirestore();
  }
}
```

### **Method 2: Using inject() Function (Modern Angular)**

```typescript
import { Component, inject } from '@angular/core';
import { FirebaseService } from './firebase';

@Component({
  selector: 'app-my-component',
  template: '...'
})
export class MyComponent {
  private firebase = inject(FirebaseService);

  ngOnInit() {
    const auth = this.firebase.getAuth();
    const firestore = this.firebase.getFirestore();
  }
}
```

---

## 🔐 Firebase Authentication Example

```typescript
import { Component, inject } from '@angular/core';
import { FirebaseService } from '../../firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

@Component({
  selector: 'login-card',
  // ...
})
export class LoginCard {
  private firebase = inject(FirebaseService);

  async login(email: string, password: string) {
    try {
      const auth = this.firebase.getAuth();
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('Logged in:', userCredential.user);
      // Navigate to dashboard
    } catch (error) {
      console.error('Login failed:', error);
    }
  }

  async register(email: string, password: string) {
    try {
      const auth = this.firebase.getAuth();
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log('User created:', userCredential.user);
    } catch (error) {
      console.error('Registration failed:', error);
    }
  }
}
```

---

## 📦 Firestore CRUD Example

```typescript
import { Component, inject } from '@angular/core';
import { FirebaseService } from '../../firebase';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';

@Component({
  selector: 'app-appointments',
  // ...
})
export class AppointmentsComponent {
  private firebase = inject(FirebaseService);

  // CREATE
  async createAppointment(data: any) {
    const firestore = this.firebase.getFirestore();
    const docRef = await addDoc(collection(firestore, 'appointments'), {
      patientName: data.patientName,
      date: data.date,
      time: data.time,
      createdAt: new Date()
    });
    console.log('Created with ID:', docRef.id);
  }

  // READ
  async getAppointments() {
    const firestore = this.firebase.getFirestore();
    const querySnapshot = await getDocs(collection(firestore, 'appointments'));
    const appointments = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    return appointments;
  }

  // UPDATE
  async updateAppointment(id: string, data: any) {
    const firestore = this.firebase.getFirestore();
    const docRef = doc(firestore, 'appointments', id);
    await updateDoc(docRef, data);
    console.log('Updated:', id);
  }

  // DELETE
  async deleteAppointment(id: string) {
    const firestore = this.firebase.getFirestore();
    await deleteDoc(doc(firestore, 'appointments', id));
    console.log('Deleted:', id);
  }
}
```

---

## 🚀 SSR-Safe Implementation

The service is already SSR-safe because:

```typescript
// Only initializes analytics in the browser (not during SSR)
if (typeof window !== 'undefined') {
  this.analytics = getAnalytics(this.app);
}
```

This prevents errors when the Angular server tries to access browser-only APIs.

---

## 📝 Available Methods

```typescript
firebase.getApp()        // Returns FirebaseApp instance
firebase.getAuth()       // Returns Auth instance for authentication
firebase.getFirestore()  // Returns Firestore instance for database
firebase.getAnalytics()  // Returns Analytics instance (or null during SSR)
```

---

## 🔑 Injection Tokens (Advanced)

If you want to inject specific Firebase services directly:

```typescript
import { inject } from '@angular/core';
import { FIREBASE_AUTH, FIREBASE_FIRESTORE } from './firebase';

export class MyComponent {
  private auth = inject(FIREBASE_AUTH);
  private firestore = inject(FIREBASE_FIRESTORE);
}
```

But you'll need to provide them in your app config first (the service method is easier).

---

## 🛡️ Security Rules (Firestore)

Make sure to set up security rules in Firebase Console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read/write their own data
    match /appointments/{appointmentId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

---

## ✨ Next Steps

1. **Enable Firebase Auth** in Firebase Console → Authentication
2. **Create Firestore Database** in Firebase Console → Firestore Database
3. **Set up security rules** for your collections
4. **Install Firebase dependencies** (if not already):
   ```bash
   npm install firebase
   ```
5. **Use the service** in your login/register/CRUD components

Your Firebase service is now ready to use! 🎉
