import { Component, Input, Output, EventEmitter, OnInit, OnChanges, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-error-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './error-modal.html',
  styleUrl: './error-modal.scss',
  encapsulation: ViewEncapsulation.None
})
export class ErrorModalComponent implements OnInit, OnChanges {
  @Input() message: string = '';
  @Input() title: string = 'Error';
  @Input() buttonText: string = 'Try Again';
  @Output() close = new EventEmitter<void>();

  ngOnInit() {
    console.log('❌ ErrorModalComponent initialized');
    console.log('💬 Title:', this.title);
    console.log('💬 Message:', this.message);
  }

  ngOnChanges() {
    console.log('🔄 ErrorModal inputs changed');
    console.log('💬 Title:', this.title);
    console.log('💬 Message:', this.message);
    console.log('🔘 Button text:', this.buttonText);
    console.log('✅ ERROR MODAL IS NOW RENDERED!');
    console.log('📍 Check if you can see the red overlay with blur effect');
  }

  onClose() {
    console.log('✅ Close button clicked in ErrorModal');
    this.close.emit();
  }
}
