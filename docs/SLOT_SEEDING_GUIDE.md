# 🌱 Slot Seeding Guide

This guide explains how to seed your Firebase Firestore with time slots.

## 📋 Prerequisites

1. Firebase project set up
2. Firestore enabled
3. Firebase config ready

## 🚀 Setup

### 1. Update Firebase Config

Edit `scripts/seed-slots.ts` and replace the Firebase config with your actual credentials:

```typescript
const firebaseConfig = {
  apiKey: "YOUR-API-KEY",
  authDomain: "YOUR-PROJECT.firebaseapp.com",
  projectId: "YOUR-PROJECT-ID",
  storageBucket: "YOUR-PROJECT.appspot.com",
  messagingSenderId: "YOUR-SENDER-ID",
  appId: "YOUR-APP-ID"
};
```

### 2. Install Dependencies

```bash
npm install tsx --save-dev
```

### 3. Run the Seeding Script

```bash
npx tsx scripts/seed-slots.ts
```

## 📊 What Gets Created

The script creates **976 time slots**:

- **Dates**: October 1-31 and November 1-30, 2025 (61 days)
- **Times per day**: 8:00 AM to 3:30 PM in 30-minute intervals (16 slots)
- **Format**: Document ID like `2025-10-15_08-00_AM`

### Slot Structure

Each slot document contains:
```typescript
{
  slotId: "2025-10-15_08-00_AM",
  date: "2025-10-15",
  time: "8:00 AM",
  isAvailable: true,
  createdAt: Timestamp
}
```

## ⚠️ Important Notes

- **Run once**: This script is meant to be run once to populate initial data
- **Idempotent**: Safe to run multiple times (will overwrite existing slots)
- **Production**: For production, consider running this on a schedule or via Cloud Functions

## 🔧 Customization

### Change Date Range

Edit the `generateDates()` function:

```typescript
function generateDates(): string[] {
  const dates: string[] = [];
  
  // Your custom date range here
  for (let day = 1; day <= 31; day++) {
    dates.push(`2025-12-${day.toString().padStart(2, '0')}`);
  }
  
  return dates;
}
```

### Change Time Slots

Edit the `TIME_SLOTS` array:

```typescript
const TIME_SLOTS = [
  '9:00 AM', '10:00 AM', '11:00 AM',
  '1:00 PM', '2:00 PM', '3:00 PM'
];
```

## ✅ Verification

After running the script, verify in Firebase Console:
1. Go to Firestore Database
2. Check the `slots` collection
3. You should see 976 documents

## 🔒 Security

**Important**: Never commit your actual Firebase credentials to Git!

Create a `.env` file for credentials:
```env
FIREBASE_API_KEY=your-key
FIREBASE_PROJECT_ID=your-project
```

Then update the script to use environment variables.

## 🐛 Troubleshooting

### "Cannot find name 'process'"
Run: `npm install --save-dev @types/node`

### "Permission denied"
Check your Firestore security rules. For seeding, you might need to temporarily allow writes.

### "Module not found"
Make sure you have Firebase installed: `npm install firebase`

## 📚 Next Steps

After seeding:
1. Set up proper Firestore security rules (see `COLLECTIONS_STRUCTURE.md`)
2. Create composite indexes in Firebase Console
3. Test the booking flow in your app

Happy booking! 🎉
