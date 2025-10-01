import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { NgClass, NgStyle } from '@angular/common';
import { SkeletonLoader } from '../skeleton-loader/skeleton-loader';

@Component({
  selector: 'time-slots',
  imports: [NgClass, NgStyle, SkeletonLoader],
  templateUrl: './time-slots.html',
  styleUrl: './time-slots.scss'
})
export class TimeSlots implements OnInit, OnChanges {
  @Input() startHour: number = 8;
  @Input() endHour: number = 15;
  @Input() endMinute: number = 30;
  @Input() intervalMinutes: number = 30;
  @Input() columns: number = 4;
  @Input() disabledSlots: string[] = [];
  @Input() loading: boolean = false; // New loading input

  @Output() slotSelected = new EventEmitter<string | null>();

  slots: string[] = [];
  selectedSlot: string | null = null;

  ngOnInit() {
    this.generateSlots();
    this.selectFirstAvailableSlot();
  }

  ngOnChanges(changes: SimpleChanges) {
    // When disabledSlots changes, revalidate selected slot
    if (changes['disabledSlots'] && !changes['disabledSlots'].firstChange) {
      if (this.selectedSlot && this.disabledSlots.includes(this.selectedSlot)) {
        // Current selection is now disabled, select first available
        this.selectFirstAvailableSlot();
      }
    }
  }

  private generateSlots() {
    const startMinutes = this.startHour * 60;
    const endMinutes = this.endHour * 60 + this.endMinute;
    
    for (let m = startMinutes; m <= endMinutes; m += this.intervalMinutes) {
      this.slots.push(this.formatTime(m));
    }
  }

  private formatTime(totalMinutes: number): string {
    const h = Math.floor(totalMinutes / 60);
    const min = totalMinutes % 60;
    const hour12 = h % 12 === 0 ? 12 : h % 12;
    const ampm = h < 12 ? 'AM' : 'PM';
    return `${hour12}:${min.toString().padStart(2, '0')} ${ampm}`;
  }

  selectSlot(slot: string) {
    if (this.disabledSlots.includes(slot)) return;
    
    // Toggle selection: if already selected, keep it selected (don't deselect)
    this.selectedSlot = slot;
    this.slotSelected.emit(this.selectedSlot);
  }

  isDisabled(slot: string): boolean {
    return this.disabledSlots.includes(slot);
  }

  private selectFirstAvailableSlot() {
    // Find first slot that's not disabled
    const firstAvailable = this.slots.find(slot => !this.disabledSlots.includes(slot));
    this.selectedSlot = firstAvailable || null;
    // Defer emission to avoid ExpressionChangedAfterItHasBeenCheckedError
    setTimeout(() => this.slotSelected.emit(this.selectedSlot), 0);
  }
}
