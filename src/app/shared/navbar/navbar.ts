import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss'
})
export class Navbar {
  private authService = inject(AuthService);
  private router = inject(Router);
  
  isMenuOpen = false;

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  async logout() {
    try {
      console.log('🔓 Navbar: Logging out...');
      await this.authService.signOut();
      console.log('✅ Navbar: Logout successful, redirecting to login');
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('❌ Navbar: Logout error', error);
    }
  }
}
