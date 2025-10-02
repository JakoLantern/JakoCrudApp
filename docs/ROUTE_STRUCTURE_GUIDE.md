# Route Structure & Navigation Guide

## 🗺️ Route Hierarchy

```
📁 Application Routes
│
├── 🔓 Public Routes (Guest Only)
│   ├── /login ..................... Login page (redirects to /dashboard if authenticated)
│   └── /register ................. Registration page (redirects to /dashboard if authenticated)
│
└── 🔐 Protected Routes (Authentication Required)
    ├── / ......................... Redirects to /dashboard
    ├── /dashboard ................ Main dashboard/home page
    ├── /appointments ............. View all user appointments
    ├── /appointments/book ........ Book new appointment (with time/date resolvers)
    ├── /appointments/view ........ View appointment details
    ├── /slots .................... Manage time slots (admin)
    ├── /metrics .................. Performance metrics page
    └── /** ....................... Fallback (redirects to /dashboard)
```

## 🛡️ Route Guards

### authGuard (Protected Routes)
**Applied to**: All routes under main layout (`/`, `/dashboard`, `/appointments`, etc.)

**Behavior**:
- ✅ **Authenticated**: Allow access
- ⛔ **Not authenticated**: Redirect to `/login`

**Usage**:
```typescript
{
  path: '',
  canActivate: [authGuard],
  children: [...]
}
```

### guestGuard (Public Routes)
**Applied to**: `/login`, `/register`

**Behavior**:
- ✅ **Not authenticated**: Allow access
- ⛔ **Authenticated**: Redirect to `/dashboard`

**Usage**:
```typescript
{
  path: 'login',
  canActivate: [guestGuard],
  ...
}
```

## 🔄 Navigation Flow

### First Visit (Not Authenticated)
```
User visits any URL
    ↓
authGuard checks authentication
    ↓
Not authenticated
    ↓
Redirect to /login
    ↓
User logs in
    ↓
Redirect to /dashboard
```

### Returning User (Has Active Session)
```
User visits app
    ↓
Firebase Auth loads session from localStorage
    ↓
authGuard checks authentication
    ↓
Authenticated
    ↓
Allow access to requested route
```

### Logged-In User Tries to Access Login
```
User navigates to /login
    ↓
guestGuard checks authentication
    ↓
Already authenticated
    ↓
Redirect to /dashboard
```

### Invalid Route
```
User navigates to /invalid-route
    ↓
No matching route found
    ↓
Wildcard route (**) catches it
    ↓
Redirect to /dashboard
    ↓
authGuard checks authentication
    ↓
If not authenticated → Redirect to /login
If authenticated → Show dashboard
```

## 📋 Route Configuration

### Default Route Behavior
| URL | User State | Action |
|-----|-----------|--------|
| `/` | Not logged in | Redirect to `/login` |
| `/` | Logged in | Redirect to `/dashboard` |
| `/login` | Not logged in | Show login page |
| `/login` | Logged in | Redirect to `/dashboard` |
| `/dashboard` | Not logged in | Redirect to `/login` |
| `/dashboard` | Logged in | Show dashboard |
| `/unknown` | Not logged in | Redirect to `/login` |
| `/unknown` | Logged in | Redirect to `/dashboard` |

## 🔑 Authentication State Management

### How Auth State is Determined
1. **Firebase Auth SDK** checks for stored session in localStorage
2. **onAuthStateChanged** listener fires
3. **AuthService** updates `currentUser$` BehaviorSubject
4. **Guards** subscribe to `user$` observable
5. **Navigation decision** made based on user state

### Session Persistence
- **Type**: `browserLocalPersistence` (default)
- **Storage**: Browser localStorage
- **Lifetime**: Until user logs out or token is revoked
- **Survives**: Browser restarts, tab closes, page refreshes

### Token Management
- **Token Type**: Firebase ID Token (JWT)
- **Lifetime**: 1 hour
- **Auto-refresh**: Every 50 minutes
- **Usage**: For authenticated API calls

## 🚀 Quick Navigation Examples

### In Templates
```html
<!-- Navigate to dashboard -->
<a routerLink="/dashboard">Dashboard</a>

<!-- Navigate to book appointment -->
<a routerLink="/appointments/book">Book Appointment</a>

<!-- Navigate to login (only works if not authenticated) -->
<a routerLink="/login">Login</a>
```

### In Components
```typescript
constructor(private router: Router) {}

// Navigate programmatically
goToDashboard() {
  this.router.navigate(['/dashboard']);
}

// Navigate with query params
goToAppointments() {
  this.router.navigate(['/appointments'], {
    queryParams: { tab: 'upcoming' }
  });
}

// Navigate and replace history
logout() {
  this.authService.signOut();
  this.router.navigate(['/login'], {
    replaceUrl: true
  });
}
```

## 🎯 Resolvers

### timesResolver
**Applied to**: `/appointments/book`
**Purpose**: Pre-load available time slots before showing page
**Returns**: Array of available times

### datesResolver
**Applied to**: `/appointments/book`
**Purpose**: Pre-load available dates before showing page
**Returns**: Array of available dates

**Usage**:
```typescript
{
  path: 'appointments/book',
  resolve: {
    times: timesResolver,
    dates: datesResolver
  }
}
```

**Access in Component**:
```typescript
constructor(private route: ActivatedRoute) {
  this.route.data.subscribe(data => {
    const times = data['times'];
    const dates = data['dates'];
  });
}
```

## 🧪 Testing Navigation

### Test 1: Default Route
```bash
# Not logged in
Navigate to: /
Expected: Redirects to /login

# Logged in
Navigate to: /
Expected: Redirects to /dashboard
```

### Test 2: Protected Routes
```bash
# Not logged in
Navigate to: /appointments
Expected: Redirects to /login

# Logged in
Navigate to: /appointments
Expected: Shows appointments page
```

### Test 3: Guest Routes
```bash
# Not logged in
Navigate to: /login
Expected: Shows login page

# Logged in
Navigate to: /login
Expected: Redirects to /dashboard
```

### Test 4: Invalid Routes
```bash
# Any user
Navigate to: /does-not-exist
Expected: Redirects to /dashboard (or /login if not authenticated)
```

## 🔒 Security Notes

1. **All sensitive routes are protected** by `authGuard`
2. **Guest routes prevent logged-in users** from accessing login/register
3. **Wildcard route** ensures no unhandled routes exist
4. **Guards use observables** for real-time auth state
5. **Session stored securely** in browser localStorage (encrypted by browser)

## 📝 Adding New Routes

### Protected Route (Requires Auth)
```typescript
{
  path: 'new-protected-route',
  loadComponent: () => import('./pages/new-page/new-page').then(m => m.NewPage),
  // No need to add canActivate - inherited from parent
}
```

### Public Route (Guest Only)
```typescript
{
  path: 'new-public-route',
  loadComponent: () => import('./pages/public/public').then(m => m.Public),
  canActivate: [guestGuard]
}
```

### Admin-Only Route (Future)
```typescript
// First create adminGuard in guards/admin.guard.ts
{
  path: 'admin',
  loadComponent: () => import('./pages/admin/admin').then(m => m.Admin),
  canActivate: [authGuard, adminGuard] // Stack multiple guards
}
```

## 🎓 Best Practices

1. ✅ Always use `routerLink` instead of `href` for navigation
2. ✅ Use lazy loading (`loadComponent`) for better performance
3. ✅ Add resolvers for data that must be loaded before page display
4. ✅ Use route guards to protect sensitive routes
5. ✅ Keep route structure shallow (avoid deep nesting)
6. ✅ Use meaningful, RESTful route names
7. ✅ Always handle wildcard routes (prevent 404s)
8. ✅ Test all route combinations (authenticated/not authenticated)

## 🐛 Common Issues

### Issue: Redirect Loop
**Symptom**: Browser keeps redirecting between routes
**Cause**: Guard logic conflict or incorrect guard placement
**Fix**: Ensure authGuard and guestGuard are not on the same route

### Issue: Route Not Found
**Symptom**: Page shows blank or 404
**Cause**: Route not defined or lazy loading failed
**Fix**: Check route path and component import

### Issue: Guard Not Triggering
**Symptom**: Can access protected route without authentication
**Cause**: Guard not imported or not added to route
**Fix**: Import guard in `app.routes.ts` and add to `canActivate`

### Issue: Can't Navigate After Login
**Symptom**: Stuck on login page after successful login
**Cause**: Not calling router.navigate after login
**Fix**: Add navigation logic in login component:
```typescript
await this.authService.login(data);
this.router.navigate(['/dashboard']);
```
