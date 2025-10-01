# Firebase Auth Initialization Fix

## Problem
After a full page refresh, the booking-table component was stuck in a loading state and wouldn't retrieve appointments. This occurred because:

1. **Auth State Not Ready**: When the page refreshed, `ngOnInit()` in `booking-table` would immediately call `loadAppointments()`
2. **Null currentUser**: At that moment, `auth.currentUser` was still `null` because Firebase Auth hadn't finished restoring the user session
3. **Empty Results**: `getUserAppointments()` would return an empty array, leaving the UI stuck in loading state

## Root Cause
Firebase Auth operates asynchronously and needs time to restore the user session after a page refresh or SSR hydration. The `auth.currentUser` property is synchronous and returns `null` until the auth state is fully initialized.

This is especially problematic in SSR scenarios where:
- The app hydrates on the client
- Components initialize immediately
- Firebase Auth hasn't finished restoring the session yet

## Solution

### 1. Auth State Management in `AuthService`
Added proper auth state management using RxJS observables:

```typescript
private currentUser$ = new BehaviorSubject<User | null>(null);
private authInitialized$ = new BehaviorSubject<boolean>(false);

constructor() {
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
```

**Key points:**
- Uses `onAuthStateChanged()` to listen for auth state changes
- Tracks when auth is fully initialized with `authInitialized$`
- Stores current user in `currentUser$` BehaviorSubject

### 2. Wait for Auth Initialization
Added a `waitForAuthInit()` method that promises to return the user only after auth is ready:

```typescript
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
```

**Benefits:**
- Returns immediately if auth is already initialized
- Waits for initialization if not ready yet
- Returns the actual user (or null if not logged in)

### 3. Updated `AppointmentsService` Methods
Modified all methods that need authentication to wait for auth initialization:

```typescript
async getUserAppointments(): Promise<Appointment[]> {
  console.log('⏳ Waiting for auth initialization...');
  const currentUser = await this.authService.waitForAuthInit();
  
  if (!currentUser) {
    console.log('❌ No user logged in after auth initialization');
    return [];
  }
  
  // Now safe to query with currentUser.uid
  const appointmentsRef = collection(this.firestore, 'appointments');
  const q = query(appointmentsRef, where('userId', '==', currentUser.uid));
  // ...
}
```

**Updated methods:**
- `getUserAppointments()` - Now waits for auth before querying
- `bookAppointment()` - Ensures user is authenticated
- `cancelAppointment()` - Verifies user before cancellation

## How It Works

### Page Refresh Scenario:
1. User refreshes the page
2. Angular app initializes
3. `booking-table` component `ngOnInit()` fires
4. `loadAppointments()` is called
5. `getUserAppointments()` is called
6. **New behavior**: Waits for `waitForAuthInit()` to resolve
7. Firebase Auth finishes restoring session
8. `onAuthStateChanged` fires with the user
9. `waitForAuthInit()` resolves with the user
10. Query executes with the correct `userId`
11. Appointments are retrieved and displayed

### Navigation Scenario:
1. User navigates to view-appointment page
2. Auth is already initialized (from previous pages)
3. `waitForAuthInit()` returns immediately
4. Appointments load instantly

## Benefits

✅ **Fixes Page Refresh Issue**: Appointments now load correctly after a full page refresh  
✅ **SSR Compatible**: Handles server-side rendering and client hydration properly  
✅ **No Race Conditions**: Guarantees auth state is ready before querying  
✅ **Better UX**: Users see their appointments load reliably in all scenarios  
✅ **Comprehensive Logging**: Console logs trace the entire auth initialization flow  

## Testing Checklist

- [x] Appointments load after page refresh
- [x] Appointments load after navigation
- [x] Appointments load after login
- [x] Loading state updates correctly
- [x] Empty state shows when no appointments
- [x] Console logs show auth initialization flow
- [x] Works in both SSR and client-side rendering

## Related Files

- `src/app/services/auth.service.ts` - Auth state management
- `src/app/services/appointments.service.ts` - Uses auth initialization
- `src/app/pages/appointments/components/booking-table/booking-table.ts` - Displays appointments

## References

- [Firebase Auth State Persistence](https://firebase.google.com/docs/auth/web/auth-state-persistence)
- [onAuthStateChanged Documentation](https://firebase.google.com/docs/auth/web/manage-users#get_the_currently_signed-in_user)
