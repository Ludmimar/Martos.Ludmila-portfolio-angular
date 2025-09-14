import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme';

describe('ThemeService', () => {
  let service: ThemeService;
  let mockLocalStorage: { [key: string]: string };

  beforeEach(() => {
    // Reset localStorage mock
    mockLocalStorage = {};
    (localStorage.getItem as jest.Mock).mockImplementation((key: string) => mockLocalStorage[key] || null);
    (localStorage.setItem as jest.Mock).mockImplementation((key: string, value: string) => {
      mockLocalStorage[key] = value;
    });
    (localStorage.removeItem as jest.Mock).mockImplementation((key: string) => {
      delete mockLocalStorage[key];
    });

    // Reset document mock
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.removeAttribute('lang');

    // Mock matchMedia
    (window.matchMedia as jest.Mock).mockReturnValue({
      matches: false,
      media: '(prefers-color-scheme: dark)',
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    });

    TestBed.configureTestingModule({
      providers: [ThemeService]
    });
    service = TestBed.inject(ThemeService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should initialize with light theme when no saved theme and system prefers light', () => {
      (window.matchMedia as jest.Mock).mockReturnValue({
        matches: false,
        media: '(prefers-color-scheme: dark)',
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      });

      const newService = new ThemeService();
      expect(newService.getCurrentTheme()).toBe('light');
      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    });

    it('should initialize with dark theme when no saved theme and system prefers dark', () => {
      (window.matchMedia as jest.Mock).mockReturnValue({
        matches: true,
        media: '(prefers-color-scheme: dark)',
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      });

      const newService = new ThemeService();
      expect(newService.getCurrentTheme()).toBe('dark');
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });

    it('should initialize with saved theme when available', () => {
      mockLocalStorage['portfolio-theme'] = 'dark';

      const newService = new ThemeService();
      expect(newService.getCurrentTheme()).toBe('dark');
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });

    it('should update meta theme-color for PWA', () => {
      const metaThemeColor = document.createElement('meta');
      metaThemeColor.name = 'theme-color';
      document.head.appendChild(metaThemeColor);

      service.setTheme('dark');
      expect(metaThemeColor.getAttribute('content')).toBe('#1a1a1a');

      service.setTheme('light');
      expect(metaThemeColor.getAttribute('content')).toBe('#ff7bac');
    });

    it('should dispatch themeChanged event', () => {
      const eventSpy = jest.spyOn(window, 'dispatchEvent');

      service.setTheme('dark');
      expect(eventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'themeChanged',
          detail: { theme: 'dark', isDark: true }
        })
      );

      service.setTheme('light');
      expect(eventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'themeChanged',
          detail: { theme: 'light', isDark: false }
        })
      );
    });
  });

  describe('Theme Management', () => {
    it('should get current theme', () => {
      service.setTheme('dark');
      expect(service.getCurrentTheme()).toBe('dark');

      service.setTheme('light');
      expect(service.getCurrentTheme()).toBe('light');
    });

    it('should return light theme as default when no theme is set', () => {
      expect(service.getCurrentTheme()).toBe('light');
    });

    it('should check if dark mode is active', () => {
      service.setTheme('dark');
      expect(service.isDarkMode()).toBe(true);

      service.setTheme('light');
      expect(service.isDarkMode()).toBe(false);
    });

    it('should toggle theme correctly', () => {
      service.setTheme('light');
      service.toggleTheme();
      expect(service.getCurrentTheme()).toBe('dark');

      service.toggleTheme();
      expect(service.getCurrentTheme()).toBe('light');
    });

    it('should set theme and update DOM', () => {
      service.setTheme('dark');
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
      expect(localStorage.setItem).toHaveBeenCalledWith('portfolio-theme', 'dark');

      service.setTheme('light');
      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
      expect(localStorage.setItem).toHaveBeenCalledWith('portfolio-theme', 'light');
    });
  });

  describe('System Theme Watching', () => {
    it('should watch system theme changes', () => {
      const addEventListenerSpy = jest.fn();
      const mockMediaQuery = {
        matches: false,
        media: '(prefers-color-scheme: dark)',
        addEventListener: addEventListenerSpy,
        removeEventListener: jest.fn(),
      };

      (window.matchMedia as jest.Mock).mockReturnValue(mockMediaQuery);

      const newService = new ThemeService();
      expect(addEventListenerSpy).toHaveBeenCalledWith('change', expect.any(Function));
    });

    it('should update theme when system preference changes and no saved theme', () => {
      const eventListener = jest.fn();
      const mockMediaQuery = {
        matches: false,
        media: '(prefers-color-scheme: dark)',
        addEventListener: jest.fn((event, callback) => {
          if (event === 'change') {
            eventListener.mockImplementation(callback);
          }
        }),
        removeEventListener: jest.fn(),
      };

      (window.matchMedia as jest.Mock).mockReturnValue(mockMediaQuery);

      const newService = new ThemeService();
      
      // Simulate system theme change to dark
      eventListener({ matches: true });
      expect(newService.getCurrentTheme()).toBe('dark');
    });

    it('should not update theme when system preference changes but theme is saved', () => {
      mockLocalStorage['portfolio-theme'] = 'light';

      const eventListener = jest.fn();
      const mockMediaQuery = {
        matches: false,
        media: '(prefers-color-scheme: dark)',
        addEventListener: jest.fn((event, callback) => {
          if (event === 'change') {
            eventListener.mockImplementation(callback);
          }
        }),
        removeEventListener: jest.fn(),
      };

      (window.matchMedia as jest.Mock).mockReturnValue(mockMediaQuery);

      const newService = new ThemeService();
      
      // Simulate system theme change to dark
      eventListener({ matches: true });
      expect(newService.getCurrentTheme()).toBe('light'); // Should remain light
    });
  });

  describe('Edge Cases', () => {
    it('should handle invalid theme values gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      service.setTheme('invalid-theme' as any);
      expect(service.getCurrentTheme()).toBe('invalid-theme');
      expect(document.documentElement.getAttribute('data-theme')).toBe('invalid-theme');

      consoleSpy.mockRestore();
    });

    it('should handle localStorage errors gracefully', () => {
      (localStorage.setItem as jest.Mock).mockImplementation(() => {
        throw new Error('Storage quota exceeded');
      });

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      expect(() => service.setTheme('dark')).not.toThrow();
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');

      consoleSpy.mockRestore();
    });

    it('should handle localStorage getItem errors gracefully', () => {
      (localStorage.getItem as jest.Mock).mockImplementation(() => {
        throw new Error('Storage access denied');
      });

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      expect(() => service.getCurrentTheme()).not.toThrow();
      expect(service.getCurrentTheme()).toBe('light'); // Should return default

      consoleSpy.mockRestore();
    });

    it('should handle missing meta theme-color element', () => {
      // Remove any existing meta theme-color elements
      const existingMeta = document.querySelector('meta[name="theme-color"]');
      if (existingMeta) {
        existingMeta.remove();
      }

      expect(() => service.setTheme('dark')).not.toThrow();
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });

    it('should handle multiple meta theme-color elements', () => {
      // Create multiple meta theme-color elements
      const meta1 = document.createElement('meta');
      meta1.name = 'theme-color';
      document.head.appendChild(meta1);

      const meta2 = document.createElement('meta');
      meta2.name = 'theme-color';
      document.head.appendChild(meta2);

      expect(() => service.setTheme('dark')).not.toThrow();
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });

    it('should handle rapid theme changes', () => {
      const eventSpy = jest.spyOn(window, 'dispatchEvent');

      // Rapid theme changes
      service.setTheme('dark');
      service.setTheme('light');
      service.setTheme('dark');
      service.setTheme('light');

      expect(eventSpy).toHaveBeenCalledTimes(4);
      expect(service.getCurrentTheme()).toBe('light');
    });

    it('should handle theme changes with special characters', () => {
      const specialTheme = 'dark-mode-🌙';
      
      service.setTheme(specialTheme);
      expect(service.getCurrentTheme()).toBe(specialTheme);
      expect(document.documentElement.getAttribute('data-theme')).toBe(specialTheme);
    });

    it('should handle very long theme names', () => {
      const longTheme = 'a'.repeat(1000);
      
      service.setTheme(longTheme);
      expect(service.getCurrentTheme()).toBe(longTheme);
      expect(document.documentElement.getAttribute('data-theme')).toBe(longTheme);
    });

    it('should handle null/undefined theme values', () => {
      service.setTheme(null as any);
      expect(service.getCurrentTheme()).toBe(null);
      expect(document.documentElement.getAttribute('data-theme')).toBe('null');

      service.setTheme(undefined as any);
      expect(service.getCurrentTheme()).toBe(undefined);
      expect(document.documentElement.getAttribute('data-theme')).toBe('undefined');
    });
  });

  describe('Performance', () => {
    it('should not create multiple event listeners for system theme', () => {
      const addEventListenerSpy = jest.fn();
      const mockMediaQuery = {
        matches: false,
        media: '(prefers-color-scheme: dark)',
        addEventListener: addEventListenerSpy,
        removeEventListener: jest.fn(),
      };

      (window.matchMedia as jest.Mock).mockReturnValue(mockMediaQuery);

      // Create multiple instances
      new ThemeService();
      new ThemeService();
      new ThemeService();

      // Should only add one event listener per instance
      expect(addEventListenerSpy).toHaveBeenCalledTimes(3);
    });

    it('should handle theme changes efficiently', () => {
      const startTime = performance.now();
      
      // Perform many theme changes
      for (let i = 0; i < 100; i++) {
        service.setTheme(i % 2 === 0 ? 'light' : 'dark');
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Should complete quickly (less than 100ms for 100 operations)
      expect(duration).toBeLessThan(100);
    });
  });

  describe('Integration', () => {
    it('should work with multiple theme services', () => {
      const service1 = new ThemeService();
      const service2 = new ThemeService();

      service1.setTheme('dark');
      expect(service1.getCurrentTheme()).toBe('dark');
      expect(service2.getCurrentTheme()).toBe('dark'); // Should share localStorage

      service2.setTheme('light');
      expect(service1.getCurrentTheme()).toBe('light');
      expect(service2.getCurrentTheme()).toBe('light');
    });

    it('should persist theme across page reloads', () => {
      service.setTheme('dark');
      expect(mockLocalStorage['portfolio-theme']).toBe('dark');

      // Simulate page reload by creating new service
      const newService = new ThemeService();
      expect(newService.getCurrentTheme()).toBe('dark');
    });
  });
});
