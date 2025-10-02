# Firebase Session & Token Management Implementation

## Overview
Implemented efficient client-side Firebase session and token management with automatic token refresh, route guards, and proper authentication flow.

## 🔐 Key Features Implemented

### 1. **Authentication Guards**
Created `auth.guard.ts` with two guards:

#### `authGuard`
- Protects authenticated routes (dashboard, appointments, etc.)
- Redirects unauthenticated users to `/login`
- Uses RxJS observables for reactive authentication state

#### `guestGuard`
- Protects login/register pages
- Redirects authenticated users to `/dashboard`
- Prevents logged-in users from accessing login/register pages

### 2. **Session Management**
Enhanced `AuthService` with comprehensive session handling:

#### **Session Persistence**
```typescript
// Default: browserLocalPersistence (survives browser restarts)
// Can be changed to browserSessionPersistence (clears on browser close)
await authService.setSessionPersistence('local' | 'session');
```

#### **Automatic Token Refresh**
- Firebase ID tokens expire after 1 hour
- Automatic refresh every 50 minutes (10 min buffer)
- Prevents session expiration during active use
- Runs only in browser (not on SSR)

```typescript
// Token refresh happens automatically, but you can force it:
const token = await authService.getIdToken(true); // force refresh
```

### 3. **Token Management**

#### **ID Token Retrieval**
```typescript
// Get current ID token (use this for authenticated API calls)
const token = await authService.getIdToken();
```

#### **Token Claims**
```typescript
// Get token claims (includes custom claims like role, admin, etc.)
const claims = await authService.getTokenClaims();

// Check if user is admin
const isAdmin = await authService.isAdmin();
```

### 4. **Updated Routes**

```typescript
// ✅ Protected routes (require authentication)
/ → redirects to /dashboard
/dashboard → Protected by authGuard
/appointments → Protected by authGuard
/appointments/book → Protected by authGuard
/appointments/view → Protected by authGuard
/slots → Protected by authGuard
/metrics → Protected by authGuard

// 🔓 Public routes (redirect if authenticated)
/login → Protected by guestGuard (redirects to /dashboard if logged in)
/register → Protected by guestGuard (redirects to /dashboard if logged in)

// 🔄 Fallback
/** → redirects to /dashboard (authGuard will handle redirect to /login if not authenticated)
```

## 🚀 How It Works

### Login Flow
1. User goes to `/login`
2. `guestGuard` checks if already authenticated
   - If YES → Redirect to `/dashboard`
   - If NO → Show login page
3. User submits credentials
4. `AuthService.login()` authenticates with Firebase
5. Session is stored in browser (localStorage by default)
6. ID token is retrieved and auto-refresh starts
7. User is redirected to `/dashboard`

### Protected Route Access
1. User tries to access `/dashboard`
2. `authGuard` checks authentication state
3. If authenticated → Access granted
4. If not authenticated → Redirect to `/login`

### Session Persistence
- **Local Persistence (Default)**: Session survives browser restarts
- **Session Persistence**: Cleared when browser is closed
- **SSR Compatibility**: Persistence only set in browser environment

### Token Refresh
```
User logs in
    ↓
Token generated (valid for 1 hour)
    ↓
Auto-refresh starts (every 50 min)
    ↓
Token refreshed before expiry
    ↓
Process repeats while user is logged in
    ↓
User logs out → Auto-refresh stops
```

## 📝 Usage Examples

### In Components - Check Authentication
```typescript
constructor(private authService: AuthService) {
  // Subscribe to auth state
  this.authService.user$.subscribe(user => {
    if (user) {
      console.log('User logged in:', user.email);
    } else {
      console.log('User logged out');
    }
  });
}
```

### Making Authenticated API Calls
```typescript
async makeAuthenticatedRequest() {
  const token = await this.authService.getIdToken();
  
  if (token) {
    // Use token in Authorization header
    const headers = {
      'Authorization': `Bearer ${token}`
    };
    // Make your API call with headers
  }
}
```

### Check User Role/Claims
```typescript
async checkUserRole() {
  const claims = await this.authService.getTokenClaims();
  const role = claims?.role; // 'patient' or 'admin'
  
  const isAdmin = await this.authService.isAdmin();
  if (isAdmin) {
    // Show admin features
  }
}
```

### Change Session Persistence
```typescript
// Make session persist only for browser session (clear on close)
await this.authService.setSessionPersistence('session');

// Make session persist across browser restarts (default)
await this.authService.setSessionPersistence('local');
```

## 🔧 Technical Details

### Why This Approach?
- ✅ **Client-side only** - No need for Firebase Admin SDK
- ✅ **Automatic refresh** - No manual token management needed
- ✅ **SSR compatible** - Works with Angular Universal
- ✅ **Type-safe** - Full TypeScript support
- ✅ **Observable-based** - Reactive authentication state
- ✅ **Efficient** - Tokens cached and only refreshed when needed

### Token Lifecycle
1. **Creation**: Generated on login/register
2. **Caching**: Stored in `AuthService.idToken`
3. **Usage**: Retrieved via `getIdToken()`
4. **Refresh**: Auto-refreshed every 50 minutes
5. **Expiry**: Valid for 1 hour (Firebase default)
6. **Cleanup**: Cleared on logout

### Security Features
- ✅ Tokens stored in memory (not localStorage directly)
- ✅ Automatic refresh prevents expiration
- ✅ Guards prevent unauthorized access
- ✅ Session persistence configurable
- ✅ SSR-safe implementation

## 🧪 Testing

### Test Authentication Flow
1. Navigate to `/` → Should redirect to `/login`
2. Login with credentials
3. Should redirect to `/dashboard`
4. Try accessing `/login` → Should redirect to `/dashboard`
5. Logout → Should redirect to `/login`

### Test Token Refresh
1. Login and open browser console
2. Wait 50 minutes
3. Should see: "⏰ Auto-refreshing ID token..."
4. Token automatically refreshed

### Test Guards
```typescript
// Try to access protected route without login
// Expected: Redirect to /login

// Try to access /login while logged in
// Expected: Redirect to /dashboard
```

## 📊 Console Logs
The implementation includes comprehensive logging:
- 🔐 Auth state changes
- ✅ Token operations
- ⏰ Auto-refresh events
- ⛔ Guard decisions
- 📋 Token claims

## 🎯 Benefits Over Admin SDK Approach
1. **No backend required** - Pure client-side
2. **Simpler setup** - No server-side token management
3. **Built-in refresh** - Firebase handles token refresh
4. **Better UX** - Seamless session management
5. **Cost-effective** - No additional Firebase Admin SDK usage

## 🔄 Migration from Current Setup
No breaking changes! The implementation enhances existing functionality:
- ✅ All existing auth methods still work
- ✅ Guards are optional (can be removed from routes)
- ✅ Token management is automatic
- ✅ Backward compatible

## 📝 Environment Variables
No additional environment variables needed! Uses existing Firebase config.

## 🐛 Troubleshooting

### Issue: User logged out unexpectedly
**Solution**: Check if token refresh is running (should see logs every 50 min)

### Issue: Redirect loop between login and dashboard
**Solution**: Check that authGuard and guestGuard are not on the same route

### Issue: Guards not working
**Solution**: Ensure guards are imported in `app.routes.ts`

### Issue: Token expired error
**Solution**: Call `getIdToken(true)` to force refresh

## 🎓 Best Practices
1. Always use `getIdToken()` for API calls (never cache tokens yourself)
2. Use observables (`user$`) instead of `getCurrentUser()` for reactive updates
3. Set appropriate session persistence based on app requirements
4. Monitor console logs in development for token operations
5. Test guards thoroughly before production deployment
