import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { ApplicationRef } from '@angular/core';
import { filter, first } from 'rxjs';

// Mark the start of hydration for performance tracking
if (typeof window !== 'undefined' && typeof performance !== 'undefined') {
  performance.mark('hydration-start');
  console.log('🚀 Starting Angular hydration...');
}

bootstrapApplication(App, appConfig)
  .then((appRef) => {
    // Track when Angular is fully hydrated and stable
    if (typeof window !== 'undefined' && typeof performance !== 'undefined') {
      const applicationRef = appRef.injector.get(ApplicationRef);
      
      applicationRef.isStable.pipe(
        filter(stable => stable),
        first()
      ).subscribe(() => {
        performance.mark('hydration-end');
        performance.measure('hydration-time', 'hydration-start', 'hydration-end');
        
        const hydrationTime = performance.getEntriesByName('hydration-time')[0];
        console.log(`✅ Angular hydration complete in ${Math.round(hydrationTime.duration)}ms`);
        
        // Log all performance metrics
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (navigation) {
          console.log('📊 Performance Metrics:');
          console.log('  TTFB:', Math.round(navigation.responseStart - navigation.requestStart), 'ms');
          console.log('  DOM Interactive:', Math.round(navigation.domInteractive - navigation.fetchStart), 'ms');
          console.log('  Hydration:', Math.round(hydrationTime.duration), 'ms');
        }
      });
    }
  })
  .catch((err) => console.error(err));
