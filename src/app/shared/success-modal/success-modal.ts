import { Component, Input, Output, EventEmitter, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-success-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './success-modal.html',
  styleUrl: './success-modal.scss',
  encapsulation: ViewEncapsulation.None
})
export class SuccessModalComponent {
  @Input() message: string = '';
  @Input() buttonText: string = 'Proceed to Login';
  @Input() redirectRoute: string = '/login';
  @Output() proceed = new EventEmitter<void>();

  onProceed() {
    this.proceed.emit();
  }
}
