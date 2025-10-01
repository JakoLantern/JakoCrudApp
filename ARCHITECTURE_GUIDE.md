# Architecture Guide: Service-Based Design

## ✅ Proper Separation of Concerns

This document outlines the correct architecture for our Angular SSR CRUD application, following best practices for service-based design.

---

## 📋 Table of Contents
1. [Overview](#overview)
2. [Services vs Components](#services-vs-components)
3. [Current Implementation](#current-implementation)
4. [Code Examples](#code-examples)
5. [Next Steps](#next-steps)

---

## Overview

Our application follows a **service-based architecture** where:
- **Services** handle all business logic, API calls, and data operations
- **Components** handle UI logic, form validation, and user interactions

This separation ensures:
- ✅ Code reusability
- ✅ Easier testing
- ✅ Better maintainability
- ✅ Clear separation of concerns

---

## Services vs Components

### 🔧 Services Should Handle:

1. **All Firebase/Firestore Operations**
   - `createUserWithEmailAndPassword`
   - `signInWithEmailAndPassword`
   - `setDoc`, `getDoc`, `updateDoc`, `deleteDoc`
   - `collection`, `query`, `where`
   - Authentication state management

2. **Business Logic**
   - Data validation (e.g., checking if a slot is available)
   - Data transformations (e.g., converting Firestore timestamps)
   - Complex calculations
   - State management

3. **API Calls & Data Operations**
   - HTTP requests (if using external APIs)
   - Database queries
   - CRUD operations (Create, Read, Update, Delete)
   - Real-time listeners

### 🎨 Components Should Handle:

1. **UI Logic & Form Validation**
   - Checking if form fields are filled
   - Validating formats (email, phone, etc.)
   - Custom validators (e.g., password matching)
   - Displaying error messages

2. **User Interactions & Feedback**
   - Button clicks
   - Form submissions
   - Loading states
   - Success/error messages (alerts, toasts)
   - Navigation

3. **Calling Service Methods**
   - Calling service methods with validated data
   - Handling responses (success/error)
   - Updating UI based on service responses

4. **Rendering Data**
   - Displaying data from services
   - Formatting data for display
   - Conditional rendering (ngIf, ngFor)

---

## Current Implementation

### ✅ AuthService (d:\Josh School\Angular\jako-crud-app\src\app\services\auth.service.ts)

**Purpose:** Handles all authentication and user profile operations

**Methods:**
```typescript
// Register a new user (creates Firebase Auth user + Firestore profile)
async register(data: RegisterData): Promise<{ user: User; profile: UserProfile }>

// Login user with email/password
async login(data: LoginData): Promise<User>

// Sign out current user
async signOut(): Promise<void>

// Get user profile from Firestore
async getUserProfile(uid: string): Promise<UserProfile | null>

// Get current authenticated user
getCurrentUser(): User | null
```

**What it handles:**
- ✅ Firebase Auth operations (createUserWithEmailAndPassword, signInWithEmailAndPassword)
- ✅ Firestore operations (setDoc, getDoc)
- ✅ User profile creation and retrieval
- ✅ updateProfile for display name

---

### ✅ LoginCard Component (d:\Josh School\Angular\jako-crud-app\src\app\pages\login\components\login-card\login-card.ts)

**Purpose:** Handles login UI and form validation

**What it handles:**
- ✅ Form creation with validators (email, required)
- ✅ UI validation (checking if form is valid)
- ✅ Calling `authService.login()` with email/password
- ✅ User-friendly error messages
- ✅ Loading state management
- ✅ Navigation to dashboard on success

**What it does NOT handle:**
- ❌ Direct Firebase Auth calls
- ❌ Direct Firestore operations
- ❌ Business logic

---

### ✅ RegisterCard Component (d:\Josh School\Angular\jako-crud-app\src\app\pages\register\components\register-card\register-card.ts)

**Purpose:** Handles registration UI and form validation

**What it handles:**
- ✅ Form creation with validators (required, email, minLength)
- ✅ Custom password matching validator (UI validation)
- ✅ UI validation (checking if form is valid)
- ✅ Calling `authService.register()` with user data
- ✅ User-friendly error messages
- ✅ Loading state management
- ✅ Success alert and navigation to login

**What it does NOT handle:**
- ❌ Direct Firebase Auth calls
- ❌ Direct Firestore operations (setDoc, Timestamp)
- ❌ Business logic (profile creation)

---

## Code Examples

### ✅ Good: Component calls service

```typescript
// login-card.ts (COMPONENT)
async onLogin(): Promise<void> {
  // UI validation
  if (this.loginForm.invalid) {
    this.errorMessage = 'Please fill in all required fields correctly.';
    return;
  }

  try {
    this.loading = true;
    const { email, password } = this.loginForm.value;
    
    // Call service to handle Firebase logic
    const user = await this.authService.login({ email, password });
    
    // UI feedback and navigation
    console.log('✅ Login successful!');
    this.router.navigate(['/dashboard']);
  } catch (error: any) {
    // UI error messages
    this.errorMessage = 'Login failed. Please try again.';
  } finally {
    this.loading = false;
  }
}
```

```typescript
// auth.service.ts (SERVICE)
async login(data: LoginData): Promise<User> {
  // Business logic - Firebase Auth
  const auth = this.firebase.getAuth();
  const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
  return userCredential.user;
}
```

---

### ❌ Bad: Component has Firebase logic directly

```typescript
// DON'T DO THIS - Component should NOT have Firebase operations
async onLogin(): Promise<void> {
  const auth = this.firebase.getAuth();
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  // ...
}
```

---

## Next Steps

### 1. Create AppointmentService

Similar to `AuthService`, we need an `AppointmentService` to handle:
- ✅ Creating appointments (CRUD - Create)
- ✅ Fetching appointments (CRUD - Read)
- ✅ Updating appointments (CRUD - Update)
- ✅ Canceling appointments (CRUD - Delete)
- ✅ Real-time listeners for appointments
- ✅ Slot locking logic

**File:** `d:\Josh School\Angular\jako-crud-app\src\app\services\appointment.service.ts`

**Methods:**
```typescript
async createAppointment(data: AppointmentData): Promise<Appointment>
async getAppointmentById(id: string): Promise<Appointment | null>
async getUserAppointments(userId: string): Promise<Appointment[]>
async updateAppointment(id: string, data: Partial<Appointment>): Promise<void>
async cancelAppointment(id: string): Promise<void>
```

---

### 2. Create SlotService

Handle time slot operations:
- ✅ Fetching available slots
- ✅ Locking slots temporarily (during booking)
- ✅ Releasing locks
- ✅ Checking slot availability

**File:** `d:\Josh School\Angular\jako-crud-app\src\app\services\slot.service.ts`

**Methods:**
```typescript
async getAvailableSlots(date: Date): Promise<TimeSlot[]>
async lockSlot(slotId: string, userId: string): Promise<void>
async releaseSlot(slotId: string): Promise<void>
async isSlotAvailable(slotId: string): Promise<boolean>
```

---

### 3. Update Components to Use Services

**Appointments Component:**
- Call `appointmentService.createAppointment()` instead of direct Firestore
- Call `appointmentService.getUserAppointments()` to fetch appointments
- Call `appointmentService.cancelAppointment()` to cancel

**Slots Component:**
- Call `slotService.getAvailableSlots()` to fetch slots
- Call `slotService.lockSlot()` when user selects a slot
- Call `slotService.releaseSlot()` if user navigates away

---

## Summary

### ✅ ALWAYS:
- Put Firebase/Firestore operations in services
- Put business logic in services
- Use components for UI validation and user feedback
- Components call service methods
- Keep components thin and focused on UI

### ❌ NEVER:
- Put Firebase operations directly in components
- Put business logic in components
- Use components for data operations
- Mix concerns between services and components

---

## Reference

- **AuthService Implementation:** `d:\Josh School\Angular\jako-crud-app\src\app\services\auth.service.ts`
- **LoginCard Component:** `d:\Josh School\Angular\jako-crud-app\src\app\pages\login\components\login-card\login-card.ts`
- **RegisterCard Component:** `d:\Josh School\Angular\jako-crud-app\src\app\pages\register\components\register-card\register-card.ts`
- **Firestore Design:** `d:\Josh School\Angular\jako-crud-app\FIRESTORE_COLLECTIONS_DESIGN.md`

---

**Last Updated:** 2025-01-XX
