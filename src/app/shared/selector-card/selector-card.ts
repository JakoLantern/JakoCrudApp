import { CommonModule } from '@angular/common';
import { Component, Input, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'selector-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './selector-card.html',
  styleUrl: './selector-card.scss'
})
export class SelectorCard {
  @Input() title: string = '';
  @Input() description: string = '';
  @Input() routerLink: string = '';
  @Input() set icon(value: string) {
    this.iconHtml = this.sanitizer.bypassSecurityTrustHtml(value);
  }
  public iconHtml: SafeHtml = '';

  constructor(private sanitizer: DomSanitizer) {}
}
