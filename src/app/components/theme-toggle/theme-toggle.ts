import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../services/theme';

@Component({
  selector: 'app-theme-toggle',
  imports: [CommonModule],
  template: `
    <button 
      class="theme-toggle"
      (click)="toggleTheme()"
      [attr.aria-label]="isDarkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'"
      [title]="isDarkMode ? 'Modo claro' : 'Modo oscuro'">
      <i [class]="isDarkMode ? 'fa-solid fa-sun' : 'fa-solid fa-moon'"></i>
    </button>
  `,
  styles: [`
    .theme-toggle {
      background: rgba(255, 255, 255, 0.9);
      border: 2px solid var(--primary, #ff7bac);
      color: var(--primary, #ff7bac);
      border-radius: 50%;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      font-size: 1rem;
      position: relative;
      overflow: hidden;
      backdrop-filter: blur(10px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    [data-theme="dark"] .theme-toggle {
      background: rgba(45, 45, 45, 0.9);
      border: 2px solid var(--primary, #ff7bac);
      color: var(--primary, #ff7bac);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
    }

    .theme-toggle:hover {
      background: var(--primary, #ff7bac);
      color: white;
      transform: scale(1.1);
      box-shadow: 0 6px 16px rgba(255, 123, 172, 0.4);
    }

    [data-theme="dark"] .theme-toggle:hover {
      background: var(--primary, #ff7bac);
      color: white;
      box-shadow: 0 6px 16px rgba(255, 123, 172, 0.6);
    }

    .theme-toggle:active {
      transform: scale(0.95);
    }

    .theme-toggle i {
      transition: transform 0.3s ease;
    }

    .theme-toggle:hover i {
      transform: rotate(180deg);
    }

    /* Animación de entrada */
    .theme-toggle {
      animation: themeToggleSlideIn 0.5s ease-out;
    }

    @keyframes themeToggleSlideIn {
      from {
        opacity: 0;
        transform: translateX(20px) scale(0.8);
      }
      to {
        opacity: 1;
        transform: translateX(0) scale(1);
      }
    }

    /* Responsive */
    @media (max-width: 768px) {
      .theme-toggle {
        width: 36px;
        height: 36px;
        font-size: 0.9rem;
      }
    }
  `]
})
export class ThemeToggle implements OnInit, OnDestroy {
  isDarkMode = false;

  constructor(private themeService: ThemeService) {}

  ngOnInit() {
    this.isDarkMode = this.themeService.isDarkMode();
    
    // Escuchar cambios de tema
    window.addEventListener('themeChanged', (event: any) => {
      this.isDarkMode = event.detail.isDark;
    });
  }

  ngOnDestroy() {
    // Limpiar event listener si es necesario
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }
}
