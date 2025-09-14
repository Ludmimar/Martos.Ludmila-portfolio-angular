import { TestBed } from '@angular/core/testing';
import { TranslationService } from './translation';

describe('TranslationService', () => {
  let service: TranslationService;
  let mockLocalStorage: { [key: string]: string };

  beforeEach(() => {
    // Reset localStorage mock
    mockLocalStorage = {};
    (localStorage.getItem as jest.Mock).mockImplementation((key: string) => mockLocalStorage[key] || null);
    (localStorage.setItem as jest.Mock).mockImplementation((key: string, value: string) => {
      mockLocalStorage[key] = value;
    });

    // Reset document mock
    document.documentElement.removeAttribute('lang');

    // Mock navigator.language
    Object.defineProperty(navigator, 'language', {
      writable: true,
      value: 'en-US',
    });

    TestBed.configureTestingModule({
      providers: [TranslationService]
    });
    service = TestBed.inject(TranslationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should initialize with saved language from localStorage', () => {
      mockLocalStorage['portfolio-language'] = 'es';

      const newService = new TranslationService();
      expect(newService.getCurrentLanguage()).toBe('es');
      expect(document.documentElement.lang).toBe('es');
    });

    it('should initialize with browser language when no saved language', () => {
      Object.defineProperty(navigator, 'language', {
        writable: true,
        value: 'es-ES',
      });

      const newService = new TranslationService();
      expect(newService.getCurrentLanguage()).toBe('es');
      expect(document.documentElement.lang).toBe('es');
    });

    it('should fallback to Spanish when browser language is not supported', () => {
      Object.defineProperty(navigator, 'language', {
        writable: true,
        value: 'fr-FR',
      });

      const newService = new TranslationService();
      expect(newService.getCurrentLanguage()).toBe('es'); // Default fallback
      expect(document.documentElement.lang).toBe('es');
    });

    it('should handle browser language with only language code', () => {
      Object.defineProperty(navigator, 'language', {
        writable: true,
        value: 'en',
      });

      const newService = new TranslationService();
      expect(newService.getCurrentLanguage()).toBe('en');
      expect(document.documentElement.lang).toBe('en');
    });
  });

  describe('Language Management', () => {
    it('should get current language', () => {
      service.setLanguage('es');
      expect(service.getCurrentLanguage()).toBe('es');

      service.setLanguage('en');
      expect(service.getCurrentLanguage()).toBe('en');
    });

    it('should set language and update localStorage and DOM', () => {
      service.setLanguage('es');
      expect(localStorage.setItem).toHaveBeenCalledWith('portfolio-language', 'es');
      expect(document.documentElement.lang).toBe('es');

      service.setLanguage('en');
      expect(localStorage.setItem).toHaveBeenCalledWith('portfolio-language', 'en');
      expect(document.documentElement.lang).toBe('en');
    });

    it('should dispatch languageChanged event', () => {
      const eventSpy = jest.spyOn(window, 'dispatchEvent');

      service.setLanguage('es');
      expect(eventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'languageChanged',
          detail: { language: 'es' }
        })
      );

      service.setLanguage('en');
      expect(eventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'languageChanged',
          detail: { language: 'en' }
        })
      );
    });

    it('should not set invalid language', () => {
      const originalLanguage = service.getCurrentLanguage();
      
      service.setLanguage('invalid');
      expect(service.getCurrentLanguage()).toBe(originalLanguage);
      expect(localStorage.setItem).not.toHaveBeenCalled();
    });

    it('should not set null or undefined language', () => {
      const originalLanguage = service.getCurrentLanguage();
      
      service.setLanguage(null as any);
      expect(service.getCurrentLanguage()).toBe(originalLanguage);

      service.setLanguage(undefined as any);
      expect(service.getCurrentLanguage()).toBe(originalLanguage);
    });
  });

  describe('Translation', () => {
    it('should translate existing keys', () => {
      service.setLanguage('es');
      expect(service.translate('nav.home')).toBe('Inicio');
      expect(service.translate('hero.title')).toBe('De conectar con personas a conectar con tecnología');

      service.setLanguage('en');
      expect(service.translate('nav.home')).toBe('Home');
      expect(service.translate('hero.title')).toBe('From connecting with people to connecting with technology');
    });

    it('should return key when translation does not exist', () => {
      const nonExistentKey = 'non.existent.key';
      expect(service.translate(nonExistentKey)).toBe(nonExistentKey);
    });

    it('should return key when key is empty', () => {
      expect(service.translate('')).toBe('');
    });

    it('should handle nested keys', () => {
      service.setLanguage('es');
      expect(service.translate('contact.name')).toBe('Nombre');
      expect(service.translate('contact.email')).toBe('Email');
      expect(service.translate('contact.message')).toBe('Mensaje');
    });

    it('should handle special characters in translations', () => {
      service.setLanguage('es');
      expect(service.translate('hero.description')).toContain('anime');
      expect(service.translate('hero.description')).toContain('crochet');
    });
  });

  describe('Available Languages', () => {
    it('should return available languages', () => {
      const languages = service.getAvailableLanguages();
      expect(languages).toContain('es');
      expect(languages).toContain('en');
      expect(languages.length).toBe(2);
    });

    it('should return languages as array', () => {
      const languages = service.getAvailableLanguages();
      expect(Array.isArray(languages)).toBe(true);
    });
  });

  describe('RTL Support', () => {
    it('should return false for RTL (no RTL languages supported yet)', () => {
      expect(service.isRTL()).toBe(false);
    });

    it('should handle RTL check for different languages', () => {
      service.setLanguage('es');
      expect(service.isRTL()).toBe(false);

      service.setLanguage('en');
      expect(service.isRTL()).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should handle localStorage errors gracefully', () => {
      (localStorage.setItem as jest.Mock).mockImplementation(() => {
        throw new Error('Storage quota exceeded');
      });

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      expect(() => service.setLanguage('es')).not.toThrow();
      expect(service.getCurrentLanguage()).toBe('es');
      expect(document.documentElement.lang).toBe('es');

      consoleSpy.mockRestore();
    });

    it('should handle localStorage getItem errors gracefully', () => {
      (localStorage.getItem as jest.Mock).mockImplementation(() => {
        throw new Error('Storage access denied');
      });

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      expect(() => service.getCurrentLanguage()).not.toThrow();
      expect(service.getCurrentLanguage()).toBe('es'); // Should return default

      consoleSpy.mockRestore();
    });

    it('should handle missing navigator.language', () => {
      Object.defineProperty(navigator, 'language', {
        writable: true,
        value: undefined,
      });

      const newService = new TranslationService();
      expect(newService.getCurrentLanguage()).toBe('es'); // Should fallback to default
    });

    it('should handle empty navigator.language', () => {
      Object.defineProperty(navigator, 'language', {
        writable: true,
        value: '',
      });

      const newService = new TranslationService();
      expect(newService.getCurrentLanguage()).toBe('es'); // Should fallback to default
    });

    it('should handle rapid language changes', () => {
      const eventSpy = jest.spyOn(window, 'dispatchEvent');

      // Rapid language changes
      service.setLanguage('es');
      service.setLanguage('en');
      service.setLanguage('es');
      service.setLanguage('en');

      expect(eventSpy).toHaveBeenCalledTimes(4);
      expect(service.getCurrentLanguage()).toBe('en');
    });

    it('should handle translation with special characters in key', () => {
      const specialKey = 'key.with-special_chars@123';
      expect(service.translate(specialKey)).toBe(specialKey);
    });

    it('should handle very long translation keys', () => {
      const longKey = 'a'.repeat(1000);
      expect(service.translate(longKey)).toBe(longKey);
    });

    it('should handle translation with HTML entities', () => {
      service.setLanguage('es');
      // Assuming there are translations with HTML entities
      const translation = service.translate('hero.description');
      expect(typeof translation).toBe('string');
    });

    it('should handle concurrent language changes', () => {
      const promises = Array.from({ length: 5 }, (_, i) => {
        return new Promise(resolve => {
          setTimeout(() => {
            service.setLanguage(i % 2 === 0 ? 'es' : 'en');
            resolve(service.getCurrentLanguage());
          }, i * 10);
        });
      });

      return Promise.all(promises).then(results => {
        expect(results).toHaveLength(5);
        results.forEach(result => {
          expect(['es', 'en']).toContain(result);
        });
      });
    });
  });

  describe('Performance', () => {
    it('should translate efficiently', () => {
      const startTime = performance.now();
      
      // Perform many translations
      for (let i = 0; i < 1000; i++) {
        service.translate('nav.home');
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Should complete quickly (less than 50ms for 1000 operations)
      expect(duration).toBeLessThan(50);
    });

    it('should handle large number of translation keys', () => {
      const keys = Array.from({ length: 100 }, (_, i) => `test.key.${i}`);
      
      const startTime = performance.now();
      keys.forEach(key => service.translate(key));
      const endTime = performance.now();
      
      const duration = endTime - startTime;
      expect(duration).toBeLessThan(100);
    });
  });

  describe('Integration', () => {
    it('should work with multiple translation services', () => {
      const service1 = new TranslationService();
      const service2 = new TranslationService();

      service1.setLanguage('es');
      expect(service1.getCurrentLanguage()).toBe('es');
      expect(service2.getCurrentLanguage()).toBe('es'); // Should share localStorage

      service2.setLanguage('en');
      expect(service1.getCurrentLanguage()).toBe('en');
      expect(service2.getCurrentLanguage()).toBe('en');
    });

    it('should persist language across page reloads', () => {
      service.setLanguage('en');
      expect(mockLocalStorage['portfolio-language']).toBe('en');

      // Simulate page reload by creating new service
      const newService = new TranslationService();
      expect(newService.getCurrentLanguage()).toBe('en');
    });

    it('should maintain translation consistency across language changes', () => {
      service.setLanguage('es');
      const spanishTranslation = service.translate('nav.home');

      service.setLanguage('en');
      const englishTranslation = service.translate('nav.home');

      expect(spanishTranslation).toBe('Inicio');
      expect(englishTranslation).toBe('Home');
      expect(spanishTranslation).not.toBe(englishTranslation);
    });
  });

  describe('Translation Coverage', () => {
    it('should have translations for all navigation keys', () => {
      const navKeys = ['nav.home', 'nav.about', 'nav.skills', 'nav.projects', 'nav.contact'];
      
      navKeys.forEach(key => {
        service.setLanguage('es');
        expect(service.translate(key)).not.toBe(key);
        
        service.setLanguage('en');
        expect(service.translate(key)).not.toBe(key);
      });
    });

    it('should have translations for all hero section keys', () => {
      const heroKeys = ['hero.title', 'hero.description', 'hero.download_cv', 'hero.github', 'hero.linkedin'];
      
      heroKeys.forEach(key => {
        service.setLanguage('es');
        expect(service.translate(key)).not.toBe(key);
        
        service.setLanguage('en');
        expect(service.translate(key)).not.toBe(key);
      });
    });

    it('should have translations for all contact form keys', () => {
      const contactKeys = [
        'contact.title', 'contact.subtitle', 'contact.name', 
        'contact.email', 'contact.message', 'contact.send', 
        'contact.sending', 'contact.success'
      ];
      
      contactKeys.forEach(key => {
        service.setLanguage('es');
        expect(service.translate(key)).not.toBe(key);
        
        service.setLanguage('en');
        expect(service.translate(key)).not.toBe(key);
      });
    });
  });
});
