import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'back-button',
  imports: [RouterLink],
  templateUrl: './back-button.html',
  styleUrl: './back-button.scss'
})
export class BackButton {
  @Input() text: string = 'Back';
  @Input() routerLink: string = '';
}
