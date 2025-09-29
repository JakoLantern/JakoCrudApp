import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { NgFor, NgClass, NgStyle } from '@angular/common';

@Component({
  selector: 'time-slots',
  imports: [NgFor, NgClass, NgStyle],
  templateUrl: './time-slots.html',
  styleUrl: './time-slots.scss'
})
export class TimeSlots implements OnInit {
  @Input() startHour: number = 8;
  @Input() endHour: number = 15;
  @Input() endMinute: number = 30;
  @Input() intervalMinutes: number = 30;
  @Input() columns: number = 4;
  @Input() disabledSlots: string[] = [];

  @Output() slotSelected = new EventEmitter<string | null>();

  slots: string[] = [];
  selectedSlot: string | null = null;

  ngOnInit() {
    this.generateSlots();
    this.selectedSlot = this.slots[0] || null;
    this.slotSelected.emit(this.selectedSlot);
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
    if (this.disabledSlots.includes(slot) || this.selectedSlot === slot) return;
    
    this.selectedSlot = slot;
    this.slotSelected.emit(this.selectedSlot);
  }

  isDisabled(slot: string): boolean {
    return this.disabledSlots.includes(slot);
  }
}
