import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard {
  demoFeatures: Array<{
    title: string;
    description: string;
    iconBgClass: string;
    icon: SafeHtml;
  }>;

  constructor(private sanitizer: DomSanitizer) {
    this.demoFeatures = [
      {
        title: 'Server-Side Rendering',
        description: 'Angular Universal implementation for improved SEO and initial page load performance',
        iconBgClass: 'bg-blue-500',
        icon: this.sanitizer.bypassSecurityTrustHtml(`<svg class="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"></path>
        </svg>`)
      },
      {
        title: 'CRUD Operations',
        description: 'Create, Read, Update, Delete operations using Firebase Firestore',
        iconBgClass: 'bg-emerald-500',
        icon: this.sanitizer.bypassSecurityTrustHtml(`<svg class="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
        </svg>`)
      },
      {
        title: 'Authentication',
        description: 'Firebase Authentication with email/password and user profile management',
        iconBgClass: 'bg-purple-500',
        icon: this.sanitizer.bypassSecurityTrustHtml(`<svg class="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
        </svg>`)
      },
      {
        title: 'Time Slot Booking',
        description: 'Appointment scheduling system with real-time slot availability and locking mechanism',
        iconBgClass: 'bg-orange-500',
        icon: this.sanitizer.bypassSecurityTrustHtml(`<svg class="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
        </svg>`)
      },
      {
        title: 'Reactive Forms',
        description: 'Angular reactive forms with validation, error handling, and custom validators',
        iconBgClass: 'bg-pink-500',
        icon: this.sanitizer.bypassSecurityTrustHtml(`<svg class="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
        </svg>`)
      },
      {
        title: 'Modular Architecture',
        description: 'Component-based architecture with standalone components and modular routing',
        iconBgClass: 'bg-indigo-500',
        icon: this.sanitizer.bypassSecurityTrustHtml(`<svg class="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
        </svg>`)
      }
    ];
  }
}
