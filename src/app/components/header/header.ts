import { Component } from '@angular/core';
import { ThemeToggle } from '../theme-toggle/theme-toggle';

@Component({
  selector: 'app-header',
  imports: [ThemeToggle],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class Header {
  isMenuOpen = false;

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu() {
    this.isMenuOpen = false;
  }

  downloadCV() {
    const link = document.createElement('a');
    link.href = '/assets/files/Martos.LudmilaCV.pdf';
    link.download = 'cv-Martos.Ludmila.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
