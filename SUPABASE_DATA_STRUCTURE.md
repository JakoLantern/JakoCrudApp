# Supabase Data Structure Guide

## 🗄️ Where Your Data Goes

### **1. Authentication Data (`auth.users` table)**
This is a **system table** managed by Supabase. You don't create it manually.

When you call `signUpWithPassword()`, Supabase automatically creates:

```typescript
{
  id: "uuid-generated-by-supabase",
  email: "user@example.com",
  encrypted_password: "bcrypt-hashed-password",
  email_confirmed_at: null, // or timestamp if confirmed
  created_at: "2025-10-01T12:00:00Z",
  user_metadata: {
    first_name: "John",
    last_name: "Doe"
  }
}
```

**Location in Supabase Dashboard:**
- Go to: **Authentication → Users**
- You'll see all registered users here
- Click on a user to see their metadata

---

### **2. Custom User Profile (Optional - You Create This)**

If you want additional user data beyond what auth.users stores, create a **profiles** table:

```sql
-- In Supabase SQL Editor, run:
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  first_name TEXT,
  last_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own profile
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);
```

Then modify your registration to also insert into profiles:

```typescript
// After successful signUp
if (data.user) {
  await this.supabase.createUserProfile(
    data.user.id, 
    firstName, 
    lastName, 
    email
  );
}
```

---

## 🔍 How to Find Your Data

### **Method 1: Supabase Dashboard (Easiest)**
1. Go to https://fagyvevwzxzonmbynmte.supabase.co
2. Click **Authentication → Users**
3. You'll see:
   - Email
   - Created date
   - Confirmed status
   - Click user to see metadata (first_name, last_name)

### **Method 2: Table Editor**
1. Go to **Table Editor**
2. You'll see tables like:
   - `profiles` (if you created it)
   - Other custom tables
3. **Note:** `auth.users` is NOT visible here (it's in the auth schema)

### **Method 3: SQL Editor**
Run queries to see your data:

```sql
-- See all users (requires service_role key or admin)
SELECT * FROM auth.users;

-- See user metadata
SELECT 
  id,
  email,
  raw_user_meta_data->>'first_name' as first_name,
  raw_user_meta_data->>'last_name' as last_name,
  email_confirmed_at
FROM auth.users;
```

---

## 📊 Current Registration Flow

```
User submits form
    ↓
signUpWithPassword(email, password, firstName, lastName)
    ↓
Supabase creates entry in auth.users with:
    - id (auto-generated UUID)
    - email
    - encrypted_password
    - user_metadata: { first_name, last_name }
    ↓
If email confirmation DISABLED:
    ✅ Returns session → User logged in immediately
    
If email confirmation ENABLED:
    📧 Sends confirmation email
    ⏸️ Returns user but NO session
    User must click link before login works
```

---

## ⚡ Speed Up Authentication

### **Option 1: Disable Email Confirmation (Dev Only)**
1. Go to **Authentication → Settings**
2. Find "**Enable email confirmations**"
3. **Turn it OFF**
4. Now registration = instant login (no email needed)

### **Option 2: Use Local Development**
```typescript
// In environment.ts for local dev
export const environment = {
  production: false,
  supabaseUrl: 'http://localhost:54321', // Local Supabase
  supabaseKey: 'your-anon-key',
};
```
Run local Supabase with Docker (super fast, no network latency)

### **Option 3: Skip Session Checks (Unsafe - Dev Only)**
```typescript
// Simple mock auth for UI testing
async onLogin() {
  // Skip real auth, just redirect
  localStorage.setItem('mockUser', this.loginForm.value.email);
  this.router.navigate(['/dashboard']);
}
```

---

## 🐛 Troubleshooting

### "It's slow!"
- **Check console for timing** (`⏱️ Registration took Xms`)
- If > 3000ms: Network issue or Supabase region far away
- If < 1000ms but UI slow: UI rendering issue, not Supabase

### "No data in Supabase!"
- Check **Authentication → Users** (NOT Table Editor)
- Look for error in console (`❌ Supabase error:`)
- Verify API keys in environment.ts match dashboard

### "Can't login after registering!"
- Check if email confirmation is required
- Look in spam folder for confirmation email
- Try disabling email confirmation in settings

---

## 📝 Recommended Next Steps

1. **Disable email confirmation** for faster dev
2. **Check console output** when registering/logging in
3. **Verify data** in Authentication → Users
4. **Create profiles table** if you need more user data
5. **Add error handling** for common issues (weak password, duplicate email)
