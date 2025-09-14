import { Pipe, PipeTransform, OnDestroy } from '@angular/core';
import { TranslationService } from '../services/translation';

@Pipe({
  name: 'translate',
  pure: false // Para que se actualice cuando cambie el idioma
})
export class TranslatePipe implements PipeTransform, OnDestroy {
  private currentLanguage = 'es';

  constructor(private translationService: TranslationService) {
    this.currentLanguage = this.translationService.getCurrentLanguage();
    
    // Escuchar cambios de idioma
    window.addEventListener('languageChanged', (event: any) => {
      this.currentLanguage = event.detail.language;
    });
  }

  transform(key: string): string {
    return this.translationService.translate(key);
  }

  ngOnDestroy() {
    // Limpiar event listener si es necesario
  }
}
