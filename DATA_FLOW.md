# Data Flow Diagram

This document visualizes how data flows through our Angular SSR CRUD application.

---

## 📊 User Registration Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER REGISTRATION                            │
└─────────────────────────────────────────────────────────────────────┘

1. USER ACTION
   └─> User fills form and clicks "Register"

2. COMPONENT (register-card.ts)
   ├─> Validates form (email format, password match, required fields)
   ├─> Shows loading state
   └─> Calls: authService.register({ firstName, lastName, email, password })

3. SERVICE (auth.service.ts)
   ├─> createUserWithEmailAndPassword(auth, email, password)
   ├─> updateProfile(user, { displayName: "First Last" })
   ├─> setDoc(firestore, 'users', uid, profile)
   └─> Returns: { user, profile }

4. COMPONENT (register-card.ts)
   ├─> Receives user & profile
   ├─> Shows success alert
   ├─> Navigates to /login
   └─> OR shows error message if failed
```

---

## 📊 User Login Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                           USER LOGIN                                 │
└─────────────────────────────────────────────────────────────────────┘

1. USER ACTION
   └─> User enters email/password and clicks "Login"

2. COMPONENT (login-card.ts)
   ├─> Validates form (email format, required fields)
   ├─> Shows loading state
   └─> Calls: authService.login({ email, password })

3. SERVICE (auth.service.ts)
   ├─> signInWithEmailAndPassword(auth, email, password)
   └─> Returns: User object

4. COMPONENT (login-card.ts)
   ├─> Receives user
   ├─> Logs success
   ├─> Navigates to /dashboard
   └─> OR shows error message if failed
```

---

## 📊 Future: Appointment Booking Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                      APPOINTMENT BOOKING                             │
└─────────────────────────────────────────────────────────────────────┘

1. USER ACTION
   └─> User selects date, time slot, and service

2. COMPONENT (book-appointment.ts)
   ├─> Validates form (date selected, slot selected, etc.)
   ├─> Shows loading state
   └─> Calls: slotService.lockSlot(slotId, userId)

3. SERVICE (slot.service.ts)
   ├─> Checks if slot is available
   ├─> Creates lock in 'slot_locks' collection
   └─> Returns: Lock confirmation

4. COMPONENT (book-appointment.ts)
   └─> Calls: appointmentService.createAppointment(data)

5. SERVICE (appointment.service.ts)
   ├─> Creates appointment in 'appointments' collection
   ├─> Updates slot status to 'booked'
   ├─> Releases lock
   └─> Returns: Appointment object

6. COMPONENT (book-appointment.ts)
   ├─> Shows success modal
   ├─> Navigates to /appointments/view/:id
   └─> OR shows error and releases lock if failed
```

---

## 📊 Service Layer Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         SERVICE LAYER                                │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────────────┐
│   FirebaseService    │  <-- Low-level Firebase SDK access
│   (firebase.ts)      │      - getAuth()
└──────────────────────┘      - getFirestore()
           ▲
           │ injects
           │
┌──────────┴───────────────────────────────────────────────────────┐
│                                                                   │
│  ┌──────────────┐   ┌────────────────┐   ┌──────────────┐      │
│  │ AuthService  │   │ AppointmentSvc │   │  SlotService │      │
│  │              │   │                │   │              │      │
│  │ - register() │   │ - create()     │   │ - getSlots() │      │
│  │ - login()    │   │ - get()        │   │ - lockSlot() │      │
│  │ - signOut()  │   │ - update()     │   │ - release()  │      │
│  │ - getProfile │   │ - cancel()     │   │              │      │
│  └──────────────┘   └────────────────┘   └──────────────┘      │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
           ▲
           │ injects
           │
┌──────────┴───────────────────────────────────────────────────────┐
│                        COMPONENTS                                 │
│                                                                   │
│  ┌──────────────┐   ┌────────────────┐   ┌──────────────┐      │
│  │  LoginCard   │   │ BookAppointment│   │  TimeSlots   │      │
│  │              │   │                │   │              │      │
│  │ - Form       │   │ - Form         │   │ - Display    │      │
│  │ - Validation │   │ - Validation   │   │ - Click      │      │
│  │ - UI State   │   │ - UI State     │   │ - Selection  │      │
│  └──────────────┘   └────────────────┘   └──────────────┘      │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

---

## 📊 Component-Service Interaction Pattern

### ✅ Correct Pattern

```typescript
// COMPONENT
async onSubmit() {
  // 1. UI Validation
  if (this.form.invalid) {
    this.errorMessage = 'Please fill all fields';
    return;
  }

  try {
    // 2. Show loading
    this.loading = true;

    // 3. Call service
    const result = await this.myService.doSomething(this.form.value);

    // 4. Handle success (UI logic)
    this.router.navigate(['/success']);
  } catch (error) {
    // 5. Handle error (UI logic)
    this.errorMessage = 'Something went wrong';
  } finally {
    // 6. Hide loading
    this.loading = false;
  }
}
```

```typescript
// SERVICE
async doSomething(data: MyData): Promise<Result> {
  // 1. Business validation
  if (!this.isValid(data)) {
    throw new Error('Invalid data');
  }

  // 2. Database operation
  const firestore = this.firebase.getFirestore();
  const docRef = await addDoc(collection(firestore, 'items'), data);

  // 3. Return result
  return { id: docRef.id, ...data };
}
```

---

## 📊 Error Handling Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                         ERROR HANDLING                               │
└─────────────────────────────────────────────────────────────────────┘

1. SERVICE throws error
   └─> Firebase error (auth/email-already-in-use)
   └─> Network error
   └─> Validation error

2. COMPONENT catches error
   ├─> Maps Firebase error codes to user-friendly messages
   ├─> Updates errorMessage property
   ├─> Sets loading = false
   └─> Displays error in template

3. USER sees error
   └─> Clear, actionable message in the UI
```

**Example:**

```typescript
// SERVICE (throws)
async login(data: LoginData): Promise<User> {
  // Firebase throws: auth/invalid-credential
  return await signInWithEmailAndPassword(auth, email, password);
}

// COMPONENT (catches & translates)
try {
  await this.authService.login({ email, password });
} catch (error: any) {
  if (error.code === 'auth/invalid-credential') {
    this.errorMessage = 'Invalid email or password'; // ✅ User-friendly
  }
}
```

---

## 📊 State Management Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                      STATE MANAGEMENT                                │
└─────────────────────────────────────────────────────────────────────┘

COMPONENT STATE (Component Properties)
├─> loading: boolean          // UI state
├─> errorMessage: string      // UI state
├─> form: FormGroup          // Form state
└─> selectedItem: Item       // Temporary selection

SERVICE STATE (Service Properties or RxJS)
├─> currentUser$: Observable<User>    // Auth state
├─> appointments$: Observable<App[]>  // Data state
└─> cache: Map<string, Data>         // Caching

FIREBASE STATE (Firestore/Auth)
├─> auth.currentUser         // Authentication
├─> Firestore collections    // Persistent data
└─> Real-time listeners      // Live updates
```

---

## 📊 Dependency Injection Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                    DEPENDENCY INJECTION                              │
└─────────────────────────────────────────────────────────────────────┘

app.config.ts
└─> Provides: FirebaseService (providedIn: 'root')

FirebaseService
└─> Initialized once, shared across all services

AuthService
├─> Injects: FirebaseService
└─> Provides: Authentication methods

AppointmentService
├─> Injects: FirebaseService
└─> Provides: CRUD methods

Components
├─> Inject: AuthService
├─> Inject: AppointmentService
└─> Call methods on services
```

**Example:**

```typescript
// Service uses inject()
export class AuthService {
  private firebase = inject(FirebaseService);
  
  async login(data: LoginData) {
    const auth = this.firebase.getAuth();
    // ...
  }
}

// Component uses inject()
export class LoginCard {
  private authService = inject(AuthService);
  
  async onLogin() {
    await this.authService.login({ email, password });
  }
}
```

---

## Summary

### Key Principles:

1. **One Direction Flow:** User → Component → Service → Firebase → Service → Component → User
2. **Clear Boundaries:** UI logic in components, business logic in services
3. **Error Handling:** Services throw, components catch and display
4. **State Management:** Components have UI state, services have data state
5. **Dependency Injection:** Services inject services, components inject services

---

**Last Updated:** 2025-01-XX
