# Super Normalized Database Structure

## Overview

Instead of creating 976+ slot documents with redundant data, we use a **super-normalized structure** with only **77 documents total**.

## Collections

### 1. `dates` Collection (61 documents)
One document per date (October & November 2025).

```typescript
{
  dateId: "2025-10-01",
  date: "2025-10-01",
  displayDate: "October 1, 2025",
  availableTimeIds: [
    "08-00_AM",
    "08-30_AM",
    "09-00_AM",
    // ... all 16 time IDs initially
  ],
  createdAt: Timestamp
}
```

**Key Feature:** The `availableTimeIds` array contains IDs of all available time slots for that date.

### 2. `times` Collection (16 documents)
One document per time slot (8:00 AM - 3:30 PM).

```typescript
{
  timeId: "08-00_AM",
  time: "8:00 AM",
  hour: 8,
  minute: 0,
  period: "AM",
  createdAt: Timestamp
}
```

### 3. `appointments` Collection (dynamic)
One document per booked appointment.

```typescript
{
  appointmentId: "auto-generated",
  userId: "user-firebase-uid",
  dateId: "2025-10-01",
  timeId: "08-00_AM",
  status: "confirmed" | "cancelled",
  notes: "Optional notes",
  bookedAt: Timestamp,
  updatedAt: Timestamp
}
```

## How Booking Works

### 1. **Fetching Available Slots**

```typescript
// Get a date document
const dateDoc = await getDoc(doc(db, 'dates', '2025-10-01'));
const availableTimeIds = dateDoc.data()?.availableTimeIds || [];

// Get the actual time details
const times = await Promise.all(
  availableTimeIds.map(timeId => getDoc(doc(db, 'times', timeId)))
);
```

### 2. **Booking an Appointment (Transaction)**

```typescript
const bookingRef = doc(db, 'appointments', 'auto-id');
const dateRef = doc(db, 'dates', dateId);

await runTransaction(db, async (transaction) => {
  // 1. Check if time is still available
  const dateDoc = await transaction.get(dateRef);
  const availableTimeIds = dateDoc.data()?.availableTimeIds || [];
  
  if (!availableTimeIds.includes(timeId)) {
    throw new Error('Time slot no longer available');
  }
  
  // 2. Remove timeId from availableTimeIds array
  transaction.update(dateRef, {
    availableTimeIds: arrayRemove(timeId)
  });
  
  // 3. Create appointment document
  transaction.set(bookingRef, {
    userId,
    dateId,
    timeId,
    status: 'confirmed',
    bookedAt: Timestamp.now()
  });
});
```

### 3. **Cancelling an Appointment**

```typescript
await runTransaction(db, async (transaction) => {
  const appointmentRef = doc(db, 'appointments', appointmentId);
  const appointmentDoc = await transaction.get(appointmentRef);
  const { dateId, timeId } = appointmentDoc.data();
  
  // 1. Add timeId back to availableTimeIds
  const dateRef = doc(db, 'dates', dateId);
  transaction.update(dateRef, {
    availableTimeIds: arrayUnion(timeId)
  });
  
  // 2. Mark appointment as cancelled
  transaction.update(appointmentRef, {
    status: 'cancelled',
    cancelledAt: Timestamp.now()
  });
});
```

## Benefits

### ✅ Efficiency
- **77 documents** instead of 976+ slot documents
- **Smaller read costs** - fetch one date doc + time details
- **Atomic updates** with arrayRemove/arrayUnion

### ✅ Scalability
- Adding new dates: 1 document per date
- Adding new times: 1 document per time
- No combinatorial explosion

### ✅ Query Performance
- **Single read** to get all available times for a date
- **Indexed arrays** for fast availability checks
- **Efficient joins** with batch reads for time details

### ✅ Maintainability
- Single source of truth for dates and times
- Easy to add/remove time slots globally
- Clear separation of concerns

## Firestore Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Dates are read-only (created by seeding script)
    match /dates/{dateId} {
      allow read: if true;
      allow write: if false;
    }
    
    // Times are read-only (created by seeding script)
    match /times/{timeId} {
      allow read: if true;
      allow write: if false;
    }
    
    // Appointments - users can only access their own
    match /appointments/{appointmentId} {
      allow read: if request.auth != null && 
        resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && 
        request.resource.data.userId == request.auth.uid;
      allow update: if request.auth != null && 
        resource.data.userId == request.auth.uid;
    }
  }
}
```

## Seeding

Run the seeding script to populate dates and times:

```bash
npx tsx scripts/seed-slots.ts
```

This creates:
- 61 date documents (October & November 2025)
- 16 time documents (8:00 AM - 3:30 PM)
- Each date has all 16 timeIds in its `availableTimeIds` array

## Example Queries

### Get available slots for a specific date
```typescript
const dateDoc = await getDoc(doc(db, 'dates', '2025-10-01'));
const timeIds = dateDoc.data()?.availableTimeIds || [];
```

### Get all dates with availability
```typescript
const datesSnapshot = await getDocs(
  query(collection(db, 'dates'), where('availableTimeIds', '!=', []))
);
```

### Get user's appointments
```typescript
const appointmentsSnapshot = await getDocs(
  query(
    collection(db, 'appointments'),
    where('userId', '==', currentUserId),
    where('status', '==', 'confirmed')
  )
);
```

## Migration from Old Structure

If you have existing slot documents:

```typescript
// 1. Create new dates and times collections
await seedDates();
await seedTimes();

// 2. Migrate existing appointments
const oldSlots = await getDocs(collection(db, 'slots'));
for (const slotDoc of oldSlots.docs) {
  const { dateId, timeId, userId } = slotDoc.data();
  if (userId) {
    // Slot was booked - create appointment
    await addDoc(collection(db, 'appointments'), {
      userId,
      dateId,
      timeId,
      status: 'confirmed',
      bookedAt: Timestamp.now()
    });
  }
}

// 3. Delete old slots collection
// (Do this carefully after verifying migration!)
```
