import { Component, Output, EventEmitter } from '@angular/core';
import { TimeSlots } from '../../../../shared/time-slots/time-slots';
import { NgIf } from '@angular/common';

@Component({
  selector: 'time-selector',
  imports: [TimeSlots, NgIf],
  templateUrl: './time-selector.html',
  styleUrl: './time-selector.scss'
})
export class TimeSelector {
  @Output() timeSelected = new EventEmitter<string | null>();
  selectedTime: string | null = null;

  onTimeSelected(time: string | null) {
    this.selectedTime = time;
    this.timeSelected.emit(time);
  }
}
