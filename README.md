# JAKO CRUD App

A simple appointment booking system built with Angular and Firebase.

## Tech Stack

- **Frontend**: Angular 20 with Server-Side Rendering (SSR)
- **Styling**: Tailwind CSS
- **Backend**: Firebase (Auth + Firestore)
- **Dev Server**: Vite

## What It Does

This app lets users:
1. Register and login with email/password
2. View available appointment time slots
3. Book appointments
4. View their booked appointments
5. See real-time performance metrics (SSR/Hydration)

Admins can manage slots and view all bookings.

## Highlights
✅ **Modern UI** - Gradient backgrounds, frosted glass cards, mobile-responsive  
✅ **Real Performance Metrics** - Live SSR and hydration timing displayed on metrics page  
✅ **Server-Side Rendering** - Fast initial page loads with Angular SSR  
✅ **Firebase Integration** - Real-time data with Firestore, secure auth  
✅ **Live Data** - No mock data, everything fetches from Firebase  
✅ **Session Persistence** - Users stay logged in across page reloads  

## ⚠️ DEMO PROJECT - NOT PRODUCTION READY

**This is a learning/demo project. DO NOT use in production without major security improvements.**

### Security Issues (DO NOT DEPLOY AS-IS)
- 🔴 **Exposed Firebase Config**: Firebase credentials are hardcoded in `src/app/firebase.ts` (visible to anyone)
  - *Why it's bad*: Anyone can see your API keys in the browser source code
  - *Fix for production*: Use environment variables and server-side validation

- 🔴 **No Environment Variables**: All config is committed to the repo
  - *Why it's bad*: Secrets are exposed in version control
  - *Fix for production*: Use `.env` files (gitignored) and build-time environment configs

- 🔴 **Client-Side Auth Only**: All auth checks happen in the browser
  - *Why it's bad*: Users can bypass route guards with DevTools
  - *Fix for production*: Add server-side auth with Firebase Admin SDK

- 🔴 **Firestore Rules**: Currently set to allow authenticated users full access
  - *Why it's bad*: Any logged-in user can read/write any data
  - *Fix for production*: Implement proper security rules with user-specific data access

- 🔴 **No API Rate Limiting**: Nothing prevents spam or abuse
  - *Why it's bad*: Attackers can overwhelm your Firebase quota
  - *Fix for production*: Add Cloud Functions with rate limiting

- 🔴 **Token Exposure**: Firebase tokens are visible in DevTools/localStorage
  - *Why it's bad*: XSS attacks could steal tokens
  - *Fix for production*: Use httpOnly cookies with backend validation

**Bottom line**: This app is fine for learning and demos, but needs serious security work before handling real user data.

## Known Issues & Limitations

### Authentication
- ⚠️ **Auth Guard Timing**: On page reload, there's a race condition where the auth guard sometimes checks before Firebase restores the session from localStorage. This causes occasional redirects to login even when logged in.
  - *Workaround*: Extensive logging added to debug timing
  - *Root cause*: Angular router executes guards before Firebase Auth initialization completes

### Performance Metrics
- ⚠️ **Browser Compatibility**: Some metrics (LCP, CLS, TBT) are not available in Firefox
  - Shows "Not supported" or "Firefox N/A" for unavailable metrics
  
- ⚠️ **FID Measurement**: First Input Delay requires user interaction to measure
  - Shows "Awaiting input" until user clicks/types/taps

### Development
- ⚠️ **Vite Hot Reload**: Sometimes requires full page refresh after code changes
- ⚠️ **SSR Pre-bundling**: Occasionally throws pre-bundle errors requiring dev server restart

### Data
- ⚠️ **No Pagination**: All appointments load at once (fine for small datasets, not scalable)
- ⚠️ **No Date Filtering**: Can't filter appointments by date range
- ⚠️ **No Search**: Can't search through bookings

## Project Structure

```
jako-crud-app/
├── src/
│   ├── app/
│   │   ├── pages/          # Main pages (login, dashboard, appointments, metrics)
│   │   ├── services/       # Auth, appointments, Firebase services
│   │   ├── guards/         # Route protection (auth, guest)
│   │   ├── shared/         # Reusable components (navbar, modals, etc.)
│   │   └── models/         # TypeScript interfaces
│   └── ...
├── docs/                   # All documentation files
└── README.md              # This file
```

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up Firebase:
   - Create a Firebase project at [firebase.google.com](https://firebase.google.com)
   - Enable Authentication (Email/Password)
   - Create a Firestore database
   - Add your config to `src/app/firebase.ts`
   - **Note**: Your Firebase config will be visible in the browser! This is fine for demos but NOT for production.

3. Run dev server:
   ```bash
   npm run dev
   ```

4. Open `http://localhost:4200`

5. **First time setup**:
   - Register a new account
   - Your data is stored in Firebase (visible to anyone with the config!)
   - For admin access, manually update your user role in Firestore console

## Documentation

Detailed technical docs are in the `docs/` folder:
- Authentication fixes and issues
- Firebase setup and usage
- Performance optimization
- Route structure
- And more...

See `docs/README.md` for the full list.

## Note

🚨 **This is a demo project for learning purposes only.**
