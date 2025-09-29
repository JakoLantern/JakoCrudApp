import { Component } from '@angular/core';
import { Navbar } from '../../shared/navbar/navbar';
import { Footer } from "../../shared/footer/footer";
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-main',
  imports: [Navbar, Footer, RouterOutlet],
  templateUrl: './main.html',
  styleUrl: './main.scss'
})
export class Main {

}
