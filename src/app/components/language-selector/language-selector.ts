import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslationService } from '../../services/translation';

@Component({
  selector: 'app-language-selector',
  imports: [CommonModule],
  template: `
    <div class="language-selector">
      <button 
        *ngFor="let lang of availableLanguages" 
        [class.active]="lang === currentLanguage"
        (click)="changeLanguage(lang)"
        [attr.aria-label]="'Cambiar idioma a ' + lang"
        class="lang-btn">
        {{ getLanguageName(lang) }}
      </button>
    </div>
  `,
  styles: [`
    .language-selector {
      display: flex;
      gap: 0.5rem;
      align-items: center;
    }

    .lang-btn {
      background: transparent;
      border: 1px solid var(--primary, #ff7bac);
      color: var(--primary, #ff7bac);
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.8rem;
      cursor: pointer;
      transition: all 0.3s ease;
      text-transform: uppercase;
      font-weight: 600;
    }

    .lang-btn:hover {
      background: var(--primary, #ff7bac);
      color: white;
    }

    .lang-btn.active {
      background: var(--primary, #ff7bac);
      color: white;
    }

    @media (max-width: 768px) {
      .language-selector {
        gap: 0.25rem;
      }
      
      .lang-btn {
        padding: 0.2rem 0.4rem;
        font-size: 0.7rem;
      }
    }
  `]
})
export class LanguageSelector implements OnInit {
  currentLanguage = 'es';
  availableLanguages: string[] = [];

  constructor(private translationService: TranslationService) {}

  ngOnInit() {
    this.currentLanguage = this.translationService.getCurrentLanguage();
    this.availableLanguages = this.translationService.getAvailableLanguages();
    
    // Escuchar cambios de idioma
    window.addEventListener('languageChanged', (event: any) => {
      this.currentLanguage = event.detail.language;
    });
  }

  changeLanguage(language: string) {
    this.translationService.setLanguage(language);
  }

  getLanguageName(lang: string): string {
    const names: { [key: string]: string } = {
      'es': 'ES',
      'en': 'EN'
    };
    return names[lang] || lang.toUpperCase();
  }
}
