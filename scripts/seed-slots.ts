/**
 * Firebase Slot Seeding Script - Super Normalized Structure
 * 
 * To run: npx tsx scripts/seed-slots.ts
 */

/// <reference types="node" />

import { doc, setDoc, Timestamp } from 'firebase/firestore';
import { FirebaseService } from '../src/app/firebase';

// Initialize Firebase service
const firebaseService = new FirebaseService();
const db = firebaseService.getFirestore();

// Time slot definitions
const TIME_SLOTS = [
  { time: '8:00 AM', hour: 8, minute: 0, period: 'AM' },
  { time: '8:30 AM', hour: 8, minute: 30, period: 'AM' },
  { time: '9:00 AM', hour: 9, minute: 0, period: 'AM' },
  { time: '9:30 AM', hour: 9, minute: 30, period: 'AM' },
  { time: '10:00 AM', hour: 10, minute: 0, period: 'AM' },
  { time: '10:30 AM', hour: 10, minute: 30, period: 'AM' },
  { time: '11:00 AM', hour: 11, minute: 0, period: 'AM' },
  { time: '11:30 AM', hour: 11, minute: 30, period: 'AM' },
  { time: '12:00 PM', hour: 12, minute: 0, period: 'PM' },
  { time: '12:30 PM', hour: 12, minute: 30, period: 'PM' },
  { time: '1:00 PM', hour: 1, minute: 0, period: 'PM' },
  { time: '1:30 PM', hour: 1, minute: 30, period: 'PM' },
  { time: '2:00 PM', hour: 2, minute: 0, period: 'PM' },
  { time: '2:30 PM', hour: 2, minute: 30, period: 'PM' },
  { time: '3:00 PM', hour: 3, minute: 0, period: 'PM' },
  { time: '3:30 PM', hour: 3, minute: 30, period: 'PM' }
];

// Generate date objects for October and November 2025
function generateDates(): Array<{ dateId: string; date: string; displayDate: string }> {
  const dates: Array<{ dateId: string; date: string; displayDate: string }> = [];
  const months = [
    { month: 10, name: 'October', days: 31 },
    { month: 11, name: 'November', days: 30 }
  ];
  
  for (const { month, name, days } of months) {
    for (let day = 1; day <= days; day++) {
      const dateId = `2025-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      const displayDate = `${name} ${day}, 2025`;
      dates.push({ dateId, date: dateId, displayDate });
    }
  }
  
  return dates;
}

// Create time ID from time string (e.g., "8:00 AM" -> "08-00-AM")
function createTimeId(time: string): string {
  return time.replace(/:/g, '-').replace(/ /g, '_');
}

// Create slot ID from date and time IDs
function createSlotId(dateId: string, timeId: string): string {
  return `${dateId}_${timeId}`;
}

// Helper function to randomly select available times for realism
function getRandomAvailableTimes(): string[] {
  const allTimeIds = TIME_SLOTS.map(t => createTimeId(t.time));
  
  // Randomly decide the scenario for this date
  const scenario = Math.random();
  
  if (scenario < 0.1) {
    // 10% chance: Fully booked (no available times)
    return [];
  } else if (scenario < 0.25) {
    // 15% chance: Very busy (only 1-3 slots available)
    const numSlots = Math.floor(Math.random() * 3) + 1;
    return allTimeIds
      .sort(() => Math.random() - 0.5)
      .slice(0, numSlots);
  } else if (scenario < 0.5) {
    // 25% chance: Moderately busy (4-8 slots available)
    const numSlots = Math.floor(Math.random() * 5) + 4;
    return allTimeIds
      .sort(() => Math.random() - 0.5)
      .slice(0, numSlots);
  } else {
    // 50% chance: Most slots available (9-16 slots)
    const numSlots = Math.floor(Math.random() * 8) + 9;
    return allTimeIds
      .sort(() => Math.random() - 0.5)
      .slice(0, numSlots)
      .sort(); // Sort to maintain time order
  }
}

async function seedDates() {
  console.log('📅 Seeding dates collection with realistic availability...\n');
  
  const dates = generateDates();
  let totalAvailableSlots = 0;
  let fullyBookedDates = 0;
  let partiallyAvailableDates = 0;
  
  for (const dateData of dates) {
    try {
      const availableTimeIds = getRandomAvailableTimes();
      
      await setDoc(doc(db, 'dates', dateData.dateId), {
        ...dateData,
        availableTimeIds,
        createdAt: Timestamp.now()
      });
      
      totalAvailableSlots += availableTimeIds.length;
      
      if (availableTimeIds.length === 0) {
        fullyBookedDates++;
        console.log(`🔴 ${dateData.displayDate} - FULLY BOOKED`);
      } else if (availableTimeIds.length <= 3) {
        console.log(`🟡 ${dateData.displayDate} - Only ${availableTimeIds.length} slots left!`);
        partiallyAvailableDates++;
      } else {
        console.log(`🟢 ${dateData.displayDate} - ${availableTimeIds.length} slots available`);
      }
    } catch (error) {
      console.error(`❌ Error creating date ${dateData.dateId}:`, error);
    }
  }
  
  console.log(`\n✅ Created ${dates.length} dates!`);
  console.log(`   📊 ${fullyBookedDates} fully booked, ${partiallyAvailableDates} running low`);
  console.log(`   📈 Average: ${Math.round(totalAvailableSlots / dates.length)} slots per date\n`);
}

async function seedTimes() {
  console.log('⏰ Seeding times collection...\n');
  
  for (const timeData of TIME_SLOTS) {
    const timeId = createTimeId(timeData.time);
    
    try {
      await setDoc(doc(db, 'times', timeId), {
        timeId,
        ...timeData,
        createdAt: Timestamp.now()
      });
      console.log(`✅ Created time: ${timeData.time}`);
    } catch (error) {
      console.error(`❌ Error creating time ${timeId}:`, error);
    }
  }
  
  console.log(`\n✅ Created ${TIME_SLOTS.length} times!\n`);
}



async function seedAll() {
  console.log('🌱 Starting super-normalized seeding...\n');
  console.log('=' .repeat(50) + '\n');
  
  await seedDates();
  await seedTimes();
  
  console.log('=' .repeat(50));
  console.log('\n📊 Summary:');
  console.log(`   - Dates: 61 documents`);
  console.log(`   - Times: ${TIME_SLOTS.length} documents`);
  console.log(`   - Total: Only 77 documents instead of ${61 * TIME_SLOTS.length}!`);
  console.log('\n💡 Realistic Data:');
  console.log('   - 10% of dates are fully booked (no slots)');
  console.log('   - 15% of dates are very busy (1-3 slots)');
  console.log('   - 25% of dates are moderately busy (4-8 slots)');
  console.log('   - 50% of dates have most slots available (9-16 slots)');
  console.log('\n🔧 How it works:');
  console.log('   - Each date has an availableTimeIds array');
  console.log('   - When booking, remove the timeId from the array');
  console.log('   - When canceling, add the timeId back to the array');
}

// Run the seeding
seedAll()
  .then(() => {
    console.log('\n🎉 Seeding complete!');
    if (typeof process !== 'undefined') {
      process.exit(0);
    }
  })
  .catch((error) => {
    console.error('\n💥 Seeding failed:', error);
    if (typeof process !== 'undefined') {
      process.exit(1);
    }
  });
