# Metrics Change Detection Fix

## 🐛 Problem

Metrics (LCP, CLS, TBT, FID) were stuck showing "Loading..." even after timeouts expired and should have shown fallback messages like "Firefox N/A" or "Not supported".

## 🔍 Root Cause

**Angular Zoneless Change Detection Issue**

The application uses `provideZonelessChangeDetection()`, which means:
1. Angular doesn't automatically detect changes from async operations
2. `setTimeout` callbacks run outside Angular's change detection
3. `PerformanceObserver` callbacks run outside Angular's change detection
4. UI doesn't update even though component properties changed

### Why `cdr.detectChanges()` Wasn't Enough

While we called `cdr.detectChanges()` after updating values, the callbacks were running **outside** Angular's execution context. This means:
- The component tree wasn't properly marked for checking
- Change detection might not propagate to parent/child components
- Race conditions could occur with other change detection cycles

## ✅ Solution

### Added NgZone.run()

Wrapped all async operations in `NgZone.run()` to ensure they execute within Angular's zone:

```typescript
import { NgZone } from '@angular/core';

private ngZone = inject(NgZone);

// Before (doesn't trigger change detection)
setTimeout(() => {
  this.ssrMetrics[2].value = 'Firefox';
  this.cdr.detectChanges(); // ❌ Not enough!
}, 4000);

// After (triggers change detection properly)
setTimeout(() => {
  this.ngZone.run(() => { // ✅ Runs in Angular zone
    this.ssrMetrics[2].value = 'Firefox';
    this.cdr.detectChanges();
  });
}, 4000);
```

### Updated Operations

All async operations now wrapped in `NgZone.run()`:

1. **LCP Observer Callback**
   ```typescript
   const observer = new PerformanceObserver((list) => {
     this.ngZone.run(() => {
       // Update metric values
       this.cdr.detectChanges();
     });
   });
   ```

2. **LCP Timeout Fallback**
   ```typescript
   setTimeout(() => {
     this.ngZone.run(() => {
       this.ssrMetrics[2].value = 'Firefox';
       this.cdr.detectChanges();
     });
   }, 4000);
   ```

3. **CLS Observer & Timeout** - Same pattern
4. **TBT Observer & Timeout** - Same pattern  
5. **FID Observer** - Same pattern

## 📊 How It Works Now

### Change Detection Flow

```
PerformanceObserver fires
    ↓
Callback enters NgZone.run()
    ↓
Angular knows about this change
    ↓
Component property updated
    ↓
cdr.detectChanges() called
    ↓
UI updates immediately ✅
```

### Timeout Flow

```
setTimeout expires
    ↓
Callback enters NgZone.run()
    ↓
Angular knows about this change
    ↓
Fallback message set
    ↓
cdr.detectChanges() called
    ↓
"Firefox N/A" appears ✅
```

## 🎯 What Changed

### Before
```typescript
// ❌ UI doesn't update
setTimeout(() => {
  this.metric.value = 'Fallback';
  this.cdr.detectChanges();
}, 3000);
```

### After
```typescript
// ✅ UI updates correctly
setTimeout(() => {
  this.ngZone.run(() => {
    this.metric.value = 'Fallback';
    this.cdr.detectChanges();
  });
}, 3000);
```

## 🧪 Testing

### Test in Chrome/Edge
```
1. Open metrics page
2. Wait 4 seconds
Expected: All metrics show values (not "Loading...")
Result: ✅ LCP, CLS, TBT show actual values or "0"
```

### Test in Firefox
```
1. Open metrics page
2. Wait 4 seconds
Expected: Browser-specific fallback messages
Result: 
  ✅ LCP: "Firefox N/A"
  ✅ CLS: "Not supported"
  ✅ TBT: "Not supported"
  ✅ FID: "Awaiting input" (works in all browsers)
```

### Test Dynamic Updates
```
1. Open metrics page in Chrome
2. Watch console logs
3. Wait for timeout messages
Expected: See console logs AND UI updates
Result: ✅ Both console and UI update simultaneously
```

## 🔄 Timeline of Updates

| Time | What Happens | UI State |
|------|--------------|----------|
| 0s | Page loads | All show "Loading..." |
| 0.1s | TTFB, FCP, TTI calculated | Show values immediately |
| 0.1s | FID set to "Awaiting input" | Shows "Awaiting input" |
| 0.1s | Observers set up | Still "Loading..." for LCP, CLS, TBT |
| 3s | CLS timeout fires (if no shifts) | Shows "0.000" or "Not supported" |
| 3s | TBT timeout fires (if no tasks) | Shows "0 ms" or "Not supported" |
| 4s | LCP timeout fires (if no entry) | Shows value or "Firefox N/A" |
| On click | FID measured | Shows delay + input context |

## 📝 Key Concepts

### NgZone
- **Purpose**: Manages Angular's change detection zones
- **run()**: Executes code within Angular's zone
- **When to use**: Any async operation that updates component state
- **Why**: Ensures change detection runs after state updates

### Change Detection in Zoneless Apps
With `provideZonelessChangeDetection()`:
- ✅ DOM events automatically trigger change detection
- ❌ setTimeout/setInterval don't trigger change detection
- ❌ PerformanceObserver don't trigger change detection
- ❌ fetch/Promise don't trigger change detection
- **Solution**: Wrap in `NgZone.run()` + `cdr.detectChanges()`

### Performance Observers
- Run in a separate context (not Angular zone)
- Must be explicitly brought into Angular's zone
- Same applies to: Web Workers, requestAnimationFrame, etc.

## 🎓 Best Practices

### ✅ DO
```typescript
// Wrap async operations in NgZone.run()
setTimeout(() => {
  this.ngZone.run(() => {
    this.updateState();
    this.cdr.detectChanges();
  });
}, 1000);
```

### ❌ DON'T
```typescript
// This won't update UI in zoneless apps
setTimeout(() => {
  this.updateState(); // ❌ UI won't update
}, 1000);
```

### ✅ DO
```typescript
// Wrap observer callbacks
const observer = new PerformanceObserver((list) => {
  this.ngZone.run(() => {
    this.processEntries(list);
    this.cdr.detectChanges();
  });
});
```

### ❌ DON'T
```typescript
// This won't update UI
const observer = new PerformanceObserver((list) => {
  this.processEntries(list); // ❌ UI won't update
});
```

## 🐛 Troubleshooting

### Issue: Metrics still showing "Loading..."
**Check:**
1. Open console - are timeout logs appearing?
2. If yes: NgZone.run() working, but UI not updating
3. If no: Timeouts not firing

**Fix:**
- Refresh page
- Check console for errors
- Verify browser supports Performance API

### Issue: Console logs show updates but UI doesn't change
**Check:**
- Is `cdr.detectChanges()` being called?
- Is operation wrapped in `NgZone.run()`?

**Fix:**
- Ensure both `NgZone.run()` AND `cdr.detectChanges()` are present
- Check for TypeScript errors

### Issue: UI updates but wrong values shown
**Check:**
- Are fallback conditions correct?
- Is browser detection working?

**Fix:**
- Check user agent string in console
- Verify fallback logic conditions

## 🎉 Result

✅ Metrics now update dynamically after timeouts
✅ Fallback messages appear correctly
✅ Browser-specific messages show properly
✅ "Loading..." never gets stuck
✅ Change detection works reliably

## 📚 Related Patterns

This same pattern applies to:
- Web Socket messages
- IndexedDB callbacks
- Service Worker events
- Custom browser APIs
- Third-party library callbacks
- requestAnimationFrame
- IntersectionObserver
- MutationObserver

**Always wrap in NgZone.run() when:**
1. Using zoneless change detection
2. Code runs outside Angular's context
3. Component state updates but UI doesn't reflect it
