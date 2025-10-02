import { Component, OnInit, PLATFORM_ID, inject, ChangeDetectorRef, NgZone } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

interface Metric {
  title: string;
  value: string;
  unit: string;
  description: string;
  target: string;
}

@Component({
  selector: 'app-metrics',
  imports: [],
  templateUrl: './metrics.html',
  styleUrl: './metrics.scss'
})
export class Metrics implements OnInit {
  private platformId = inject(PLATFORM_ID);
  private cdr = inject(ChangeDetectorRef);
  private ngZone = inject(NgZone);
  
  // Timestamp and context for metrics collection
  metricsCollectionTime: string = '';
  metricsCollectionContext: string = 'Metrics Page Load';
  
  // FID input context tracking
  fidInputType: string = '';
  fidInputTarget: string = '';
  
  // Check if FID is waiting for input
  get isFIDAwaitingInput(): boolean {
    return this.hydrationMetrics[3].value === 'Awaiting';
  }
  
  ssrMetrics: Metric[] = [
    {
      title: 'TTFB',
      value: 'Loading...',
      unit: '',
      description: 'Time to First Byte',
      target: '< 600ms'
    },
    {
      title: 'FCP',
      value: 'Loading...',
      unit: '',
      description: 'First Contentful Paint',
      target: '< 1.8s'
    },
    {
      title: 'LCP',
      value: 'Loading...',
      unit: '',
      description: 'Largest Contentful Paint',
      target: '< 2.5s'
    },
    {
      title: 'CLS',
      value: 'Loading...',
      unit: '',
      description: 'Cumulative Layout Shift',
      target: '< 0.1'
    }
  ];

  hydrationMetrics: Metric[] = [
    {
      title: 'TTI',
      value: 'Loading...',
      unit: '',
      description: 'Time to Interactive',
      target: '< 3.8s'
    },
    {
      title: 'TBT',
      value: 'Loading...',
      unit: '',
      description: 'Total Blocking Time',
      target: '< 200ms'
    },
    {
      title: 'Hydration',
      value: 'Loading...',
      unit: '',
      description: 'Hydration Duration',
      target: '< 1s'
    },
    {
      title: 'FID',
      value: 'Awaiting',
      unit: 'input',
      description: 'First Input Delay',
      target: '< 100ms'
    }
  ];

  ngOnInit() {
    // Only run in browser
    if (isPlatformBrowser(this.platformId)) {
      // Set the collection timestamp
      this.metricsCollectionTime = new Date().toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      });
      console.log('⏰ Metrics collection time:', this.metricsCollectionTime);
      
      this.collectPerformanceMetrics();
      this.setupDynamicInputTracking();
    }
  }

  private setupDynamicInputTracking() {
    // Track all user interactions dynamically (after FID is captured)
    const trackInput = (event: Event) => {
      // Only update if FID already has a value (not waiting)
      if (this.hydrationMetrics[3].value !== 'Loading...' && 
          this.hydrationMetrics[3].value !== 'Awaiting') {
        return; // FID is already measured, no need to update
      }
      
      const eventType = event.type;
      const target = event.target as HTMLElement;
      const tagName = target.tagName?.toLowerCase() || 'unknown';
      const id = target.id;
      const className = target.className;
      
      let contextParts: string[] = [];
      contextParts.push(eventType.charAt(0).toUpperCase() + eventType.slice(1));
      
      if (tagName && tagName !== 'unknown') {
        contextParts.push(`on <${tagName}>`);
        if (id) {
          contextParts.push(`#${id}`);
        } else if (className && typeof className === 'string') {
          const firstClass = className.split(' ')[0];
          if (firstClass) {
            contextParts.push(`.${firstClass}`);
          }
        }
      }
      
      this.fidInputTarget = contextParts.join(' ');
      console.log('🎯 User interaction detected:', this.fidInputTarget);
      this.cdr.detectChanges();
    };
    
    // Listen for various input events
    ['click', 'keydown', 'touchstart', 'pointerdown'].forEach(eventType => {
      document.addEventListener(eventType, trackInput, { once: false, passive: true });
    });
  }

  private collectPerformanceMetrics() {
    console.log('🔍 Starting performance metrics collection...');
    console.log('📄 Document ready state:', document.readyState);
    
    // Wait for page to be fully loaded
    if (document.readyState === 'complete') {
      console.log('✅ Document already complete, gathering metrics immediately');
      this.gatherMetrics();
    } else {
      console.log('⏳ Waiting for window load event...');
      window.addEventListener('load', () => {
        console.log('✅ Window load event fired, gathering metrics in 100ms');
        setTimeout(() => this.gatherMetrics(), 100);
      });
    }
  }

  private gatherMetrics() {
    console.log('📊 ========== GATHERING PERFORMANCE METRICS ==========');
    
    try {
      // Get navigation timing
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      console.log('🔍 Navigation entry:', navigation);
      
      if (navigation) {
        // TTFB - Time to First Byte
        try {
          const ttfb = Math.round(navigation.responseStart - navigation.requestStart);
          this.ssrMetrics[0].value = ttfb.toString();
          this.ssrMetrics[0].unit = 'ms';
          console.log('✅ TTFB:', ttfb, 'ms');
        } catch (error) {
          console.error('❌ Error calculating TTFB:', error);
          this.ssrMetrics[0].value = 'Error';
          this.ssrMetrics[0].unit = '';
        }
      } else {
        console.warn('⚠️ No navigation entry available');
        this.ssrMetrics[0].value = 'N/A';
        this.ssrMetrics[0].unit = '';
      }

      // FCP - First Contentful Paint
      try {
        const paintEntries = performance.getEntriesByType('paint');
        console.log('🎨 Paint entries:', paintEntries);
        
        const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint');
        if (fcpEntry) {
          const fcp = (fcpEntry.startTime / 1000).toFixed(2);
          this.ssrMetrics[1].value = fcp;
          this.ssrMetrics[1].unit = 's';
          console.log('✅ FCP:', fcp, 's');
        } else {
          console.warn('⚠️ FCP entry not found in paint entries');
          this.ssrMetrics[1].value = 'N/A';
          this.ssrMetrics[1].unit = '';
        }
      } catch (error) {
        console.error('❌ Error getting FCP:', error);
        this.ssrMetrics[1].value = 'Error';
        this.ssrMetrics[1].unit = '';
      }

      // LCP - Largest Contentful Paint
      console.log('🔍 Setting up LCP observer...');
      this.observeLCP();

      // CLS - Cumulative Layout Shift
      console.log('🔍 Setting up CLS observer...');
      this.observeCLS();

      // TTI - Time to Interactive (approximation using domInteractive)
      if (navigation) {
        try {
          const tti = ((navigation.domInteractive - navigation.fetchStart) / 1000).toFixed(2);
          this.hydrationMetrics[0].value = tti;
          this.hydrationMetrics[0].unit = 's';
          console.log('✅ TTI (approx):', tti, 's');
        } catch (error) {
          console.error('❌ Error calculating TTI:', error);
          this.hydrationMetrics[0].value = 'Error';
          this.hydrationMetrics[0].unit = '';
        }
      }

      // TBT - Total Blocking Time
      console.log('🔍 Setting up TBT observer...');
      this.observeTBT();

      // Hydration Duration - Check for custom hydration mark
      console.log('🔍 Checking hydration metrics...');
      this.checkHydrationMetric();

      // FID - First Input Delay
      console.log('🔍 Setting up FID observer...');
      this.observeFID();

      console.log('📊 ========== METRICS COLLECTION COMPLETE ==========');
    } catch (error) {
      console.error('❌ CRITICAL ERROR collecting metrics:', error);
      console.error('Stack trace:', (error as Error).stack);
    }
  }

  private observeLCP() {
    try {
      console.log('🔍 Attempting to observe LCP...');
      const observer = new PerformanceObserver((list) => {
        this.ngZone.run(() => {
          const entries = list.getEntries();
          console.log('📊 LCP entries received:', entries.length);
          const lastEntry = entries[entries.length - 1] as any;
          if (lastEntry) {
            const lcp = (lastEntry.startTime / 1000).toFixed(2);
            this.ssrMetrics[2].value = lcp;
            this.ssrMetrics[2].unit = 's';
            console.log('✅ LCP updated:', lcp, 's');
            this.cdr.detectChanges();
          }
        });
      });
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
      console.log('✅ LCP observer set up successfully');
      
      // Fallback: Set fallback value after 4 seconds if no LCP captured
      setTimeout(() => {
        this.ngZone.run(() => {
          if (this.ssrMetrics[2].value === 'Loading...') {
            console.warn('⚠️ LCP timeout - no entries received after 4s');
            const userAgent = navigator.userAgent.toLowerCase();
            if (userAgent.includes('firefox')) {
              this.ssrMetrics[2].value = 'Firefox';
              this.ssrMetrics[2].unit = 'N/A';
              console.log('🦊 Firefox detected - LCP not supported');
            } else if (userAgent.includes('edge') || userAgent.includes('edg')) {
              this.ssrMetrics[2].value = 'Check';
              this.ssrMetrics[2].unit = 'console';
              console.log('🔵 Edge detected but no LCP - check console for errors');
            } else {
              this.ssrMetrics[2].value = 'Not';
              this.ssrMetrics[2].unit = 'supported';
            }
            this.cdr.detectChanges();
          }
        });
      }, 4000);
    } catch (error) {
      const errorMsg = (error as Error).message;
      console.error('❌ LCP observation error:', errorMsg);
      console.warn('⚠️ LCP observation not supported in this browser');
      this.ssrMetrics[2].value = 'N/A';
      this.ssrMetrics[2].unit = '';
      this.cdr.detectChanges();
    }
  }

  private observeCLS() {
    try {
      console.log('🔍 Attempting to observe CLS...');
      let clsValue = 0;
      const observer = new PerformanceObserver((list) => {
        this.ngZone.run(() => {
          const entries = list.getEntries();
          console.log('📊 CLS entries received:', entries.length);
          for (const entry of entries as any[]) {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
              this.ssrMetrics[3].value = clsValue.toFixed(3);
              this.ssrMetrics[3].unit = '';
              console.log('✅ CLS updated:', clsValue.toFixed(3));
              this.cdr.detectChanges();
            }
          }
        });
      });
      observer.observe({ entryTypes: ['layout-shift'] });
      console.log('✅ CLS observer set up successfully');
      
      // Set initial value to 0 after 3 seconds if no layout shifts
      setTimeout(() => {
        this.ngZone.run(() => {
          if (this.ssrMetrics[3].value === 'Loading...') {
            console.log('✅ CLS: 0.000 (no layout shifts detected)');
            this.ssrMetrics[3].value = '0.000';
            this.ssrMetrics[3].unit = '';
            this.cdr.detectChanges();
          }
        });
      }, 3000);
    } catch (error) {
      const errorMsg = (error as Error).message;
      console.error('❌ CLS observation error:', errorMsg);
      
      const userAgent = navigator.userAgent.toLowerCase();
      if (errorMsg.includes('unsupported entryTypes') || userAgent.includes('firefox')) {
        console.warn('⚠️ CLS observation not supported in this browser');
        this.ssrMetrics[3].value = 'Not';
        this.ssrMetrics[3].unit = 'supported';
      } else {
        console.warn('⚠️ CLS observation error');
        this.ssrMetrics[3].value = 'Error';
        this.ssrMetrics[3].unit = '';
      }
      this.cdr.detectChanges();
    }
  }

  private observeTBT() {
    try {
      console.log('🔍 Attempting to observe TBT (Long Tasks)...');
      let tbtValue = 0;
      const observer = new PerformanceObserver((list) => {
        this.ngZone.run(() => {
          const entries = list.getEntries();
          console.log('📊 Long task entries received:', entries.length);
          for (const entry of entries as any[]) {
            // Tasks longer than 50ms contribute to TBT
            if (entry.duration > 50) {
              tbtValue += entry.duration - 50;
              this.hydrationMetrics[1].value = Math.round(tbtValue).toString();
              this.hydrationMetrics[1].unit = 'ms';
              console.log('✅ TBT updated:', Math.round(tbtValue), 'ms (task duration:', entry.duration, 'ms)');
              this.cdr.detectChanges();
            }
          }
        });
      });
      observer.observe({ entryTypes: ['longtask'] });
      console.log('✅ TBT observer set up successfully');
      
      // Set initial value after 3 seconds if no long tasks
      setTimeout(() => {
        this.ngZone.run(() => {
          if (this.hydrationMetrics[1].value === 'Loading...') {
            console.log('✅ TBT: 0ms (no long tasks detected)');
            this.hydrationMetrics[1].value = '0';
            this.hydrationMetrics[1].unit = 'ms';
            this.cdr.detectChanges();
          }
        });
      }, 3000);
    } catch (error) {
      const errorMsg = (error as Error).message;
      console.error('❌ TBT observation error:', errorMsg);
      
      const userAgent = navigator.userAgent.toLowerCase();
      if (errorMsg.includes('unsupported entryTypes') || userAgent.includes('firefox')) {
        console.warn('⚠️ TBT observation not supported in this browser');
        this.hydrationMetrics[1].value = 'Not';
        this.hydrationMetrics[1].unit = 'supported';
      } else {
        console.warn('⚠️ TBT observation error');
        this.hydrationMetrics[1].value = 'Error';
        this.hydrationMetrics[1].unit = '';
      }
      this.cdr.detectChanges();
    }
  }

  private checkHydrationMetric() {
    try {
      console.log('🔍 Checking for hydration timing...');
      
      // Check all performance entries
      const allEntries = performance.getEntries();
      console.log('📊 Total performance entries:', allEntries.length);
      
      // Check if hydration timing was recorded
      const hydrationMeasure = performance.getEntriesByName('hydration-time')[0] || 
                              performance.getEntriesByName('angular-hydration')[0];
      
      if (hydrationMeasure) {
        const hydration = Math.round(hydrationMeasure.duration);
        this.hydrationMetrics[2].value = hydration.toString();
        this.hydrationMetrics[2].unit = 'ms';
        console.log('✅ Hydration (measured):', hydration, 'ms');
      } else {
        console.warn('⚠️ No hydration-time measure found, attempting estimation...');
        
        // Estimate based on domContentLoadedEventEnd
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        console.log('🔍 Navigation timing:', {
          domContentLoadedEventStart: navigation?.domContentLoadedEventStart,
          domContentLoadedEventEnd: navigation?.domContentLoadedEventEnd
        });
        
        if (navigation && navigation.domContentLoadedEventEnd) {
          const estimated = Math.round(navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart);
          this.hydrationMetrics[2].value = estimated.toString();
          this.hydrationMetrics[2].unit = 'ms';
          console.log('✅ Hydration (estimated):', estimated, 'ms');
        } else {
          console.warn('⚠️ Cannot estimate hydration time');
          this.hydrationMetrics[2].value = 'N/A';
          this.hydrationMetrics[2].unit = '';
        }
      }
    } catch (error) {
      console.error('❌ Error checking hydration metric:', error);
      this.hydrationMetrics[2].value = 'Error';
      this.hydrationMetrics[2].unit = '';
    }
  }

  private observeFID() {
    try {
      console.log('🔍 Attempting to observe FID...');
      const observer = new PerformanceObserver((list) => {
        this.ngZone.run(() => {
          const firstInput = list.getEntries()[0] as any;
          console.log('📊 FID entry received:', firstInput);
          if (firstInput) {
            const fid = Math.round(firstInput.processingStart - firstInput.startTime);
            this.hydrationMetrics[3].value = fid.toString();
            this.hydrationMetrics[3].unit = 'ms';
            
            // Capture input context details
            const inputName = firstInput.name || 'unknown';
            const targetElement = firstInput.target?.tagName?.toLowerCase() || 'unknown';
            const targetClass = firstInput.target?.className || '';
            const targetId = firstInput.target?.id || '';
            
            // Build descriptive context
            let contextParts: string[] = [];
            contextParts.push(inputName.charAt(0).toUpperCase() + inputName.slice(1));
            
            if (targetElement && targetElement !== 'unknown') {
              contextParts.push(`on <${targetElement}>`);
              if (targetId) {
                contextParts.push(`#${targetId}`);
              } else if (targetClass) {
                const firstClass = targetClass.split(' ')[0];
                contextParts.push(`.${firstClass}`);
              }
            }
            
            this.fidInputType = inputName;
            this.fidInputTarget = contextParts.join(' ');
            
            console.log('✅ FID:', fid, 'ms');
            console.log('📍 Input context:', this.fidInputTarget);
            this.cdr.detectChanges();
            observer.disconnect();
          }
        });
      });
      observer.observe({ entryTypes: ['first-input'] });
      console.log('✅ FID observer set up successfully (awaiting user interaction)');
      
      // Set the initial waiting message and target
      this.fidInputTarget = 'Please click, tap, or type to measure';
      console.log('⏳ FID: Awaiting user input');
    } catch (error) {
      console.error('❌ FID observation error:', error);
      console.warn('⚠️ FID observation not supported');
      this.hydrationMetrics[3].value = 'Not';
      this.hydrationMetrics[3].unit = 'supported';
      this.cdr.detectChanges();
    }
  }
}
