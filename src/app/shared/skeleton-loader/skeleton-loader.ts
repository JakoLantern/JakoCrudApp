import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'skeleton-loader',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="animate-pulse" [ngClass]="containerClass">
      @if (type === 'calendar') {
        <!-- Calendar skeleton -->
        <div class="space-y-4">
          <!-- Header -->
          <div class="flex justify-between items-center mb-4">
            <div class="h-8 w-16 bg-gray-300 rounded"></div>
            <div class="h-8 w-32 bg-gray-300 rounded"></div>
            <div class="h-8 w-16 bg-gray-300 rounded"></div>
          </div>
          <!-- Day labels -->
          <div class="grid grid-cols-7 gap-2 mb-2">
            @for (day of [1,2,3,4,5,6,7]; track day) {
              <div class="h-6 bg-gray-200 rounded"></div>
            }
          </div>
          <!-- Date cells -->
          @for (week of [1,2,3,4,5]; track week) {
            <div class="grid grid-cols-7 gap-2 mb-2">
              @for (day of [1,2,3,4,5,6,7]; track day) {
                <div class="h-12 bg-gray-300 rounded"></div>
              }
            </div>
          }
        </div>
      }
      
      @if (type === 'time-grid') {
        <!-- Time slots grid skeleton -->
        <div class="grid gap-3" [ngStyle]="{'grid-template-columns': 'repeat(' + columns + ', minmax(0, 1fr))'}">
          @for (slot of slots; track slot) {
            <div class="h-16 bg-gray-300 rounded-lg"></div>
          }
        </div>
      }
      
      @if (type === 'summary') {
        <!-- Summary card skeleton -->
        <div class="space-y-4">
          <div class="h-6 bg-gray-300 rounded w-3/4"></div>
          <div class="h-4 bg-gray-200 rounded w-1/2"></div>
          <div class="h-4 bg-gray-200 rounded w-2/3"></div>
          <div class="h-12 bg-gray-300 rounded mt-6"></div>
        </div>
      }
      
      @if (type === 'text') {
        <!-- Simple text line skeleton -->
        <div class="h-4 bg-gray-300 rounded" [ngStyle]="{'width': width}"></div>
      }
      
      @if (type === 'button') {
        <!-- Button skeleton -->
        <div class="h-12 bg-gray-300 rounded-lg" [ngStyle]="{'width': width}"></div>
      }
      
      @if (type === 'card') {
        <!-- Card skeleton -->
        <div class="space-y-3">
          <div class="h-8 bg-gray-300 rounded w-3/4"></div>
          <div class="h-4 bg-gray-200 rounded"></div>
          <div class="h-4 bg-gray-200 rounded w-5/6"></div>
          <div class="h-4 bg-gray-200 rounded w-4/6"></div>
        </div>
      }
    </div>
  `,
  styles: [`
    @keyframes shimmer {
      0% {
        background-position: -1000px 0;
      }
      100% {
        background-position: 1000px 0;
      }
    }

    .animate-pulse {
      animation: shimmer 2s infinite linear;
      background: linear-gradient(
        to right,
        #f3f4f6 0%,
        #e5e7eb 20%,
        #f3f4f6 40%,
        #f3f4f6 100%
      );
      background-size: 1000px 100%;
    }

    .animate-pulse > * {
      background: linear-gradient(
        to right,
        #f3f4f6 0%,
        #e5e7eb 20%,
        #f3f4f6 40%,
        #f3f4f6 100%
      );
      background-size: 1000px 100%;
      animation: shimmer 2s infinite linear;
    }
  `]
})
export class SkeletonLoader {
  @Input() type: 'calendar' | 'time-grid' | 'summary' | 'text' | 'button' | 'card' = 'text';
  @Input() columns: number = 4;
  @Input() rows: number = 4;
  @Input() width: string = '100%';
  @Input() containerClass: string = '';

  get slots(): number[] {
    return Array.from({ length: this.columns * this.rows }, (_, i) => i);
  }
}
