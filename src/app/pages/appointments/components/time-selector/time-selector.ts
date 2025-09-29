import { Component, Output, EventEmitter } from '@angular/core';
import { TimeSlots } from '../../../../shared/time-slots/time-slots';

@Component({
  selector: 'time-selector',
  imports: [TimeSlots],
  templateUrl: './time-selector.html',
  styleUrl: './time-selector.scss'
})
export class TimeSelector {
  @Output() timeSelected = new EventEmitter<string | null>();
  selectedTime: string | null = '8:00 AM';

  onTimeSelected(time: string | null) {
    this.selectedTime = time;
    this.timeSelected.emit(time);
  }
}
