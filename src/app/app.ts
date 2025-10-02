import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Header } from './components/header/header';
import { PetalAnimationComponent } from './components/petal-animation/petal-animation';
import { Navigation } from './components/navigation/navigation';
import { Timeline } from './components/timeline/timeline';
import { Skills } from './components/skills/skills';
import { Projects } from './components/projects/projects';
import { Future } from './components/future/future';
import { Passions } from './components/passions/passions';
import { Contact } from './components/contact/contact';
import { Footer } from './components/footer/footer';
import { ScrollService } from './services/scroll';
import { ThemeService } from './services/theme';
import { PerformanceMonitorService } from './services/performance-monitor';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    Header,
    PetalAnimationComponent,
    Navigation,
    Timeline,
    Skills,
    Projects,
    Future,
    Passions,
    Contact,
    Footer
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit, OnDestroy {
  private themeChangeSubscription?: () => void;

  constructor(
    private scrollService: ScrollService,
    private themeService: ThemeService,
    private cdr: ChangeDetectorRef,
    private performanceMonitor: PerformanceMonitorService
  ) {}

  ngOnInit() {
    console.log('🚀 App component initialized');
    
    // Inicializar animaciones de scroll
    this.scrollService.initScrollAnimations();
    this.scrollService.initScrollToTop();
    
    // Inicializar tema
    this.themeService.watchSystemTheme();
    
    // Suscribirse a cambios de tema para detectar cambios
    this.themeChangeSubscription = () => {
      this.cdr.markForCheck();
    };
    
    window.addEventListener('themeChanged', this.themeChangeSubscription);
    
    // Registrar Service Worker para PWA
    this.registerServiceWorker();
    
    // Inicializar monitoreo de performance
    this.initializePerformanceMonitoring();
  }

  ngOnDestroy() {
    if (this.themeChangeSubscription) {
      window.removeEventListener('themeChanged', this.themeChangeSubscription);
    }
  }

  private initializePerformanceMonitoring() {
    // Generar reporte de performance después de 5 segundos
    setTimeout(() => {
      const report = this.performanceMonitor.generateReport();
      console.log(report);
      
      // En desarrollo, mostrar métricas en consola
      if (!environment.production) {
        this.logPerformanceMetrics();
      }
    }, 5000);
  }

  private logPerformanceMetrics() {
    const metrics = this.performanceMonitor.getMetrics();
    const resourceMetrics = this.performanceMonitor.getResourceMetricsByType();
    
    console.group('🚀 Performance Metrics');
    console.table(metrics);
    console.table(resourceMetrics);
    console.groupEnd();
  }

  private registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then((registration) => {
            console.log('SW registrado exitosamente:', registration.scope);
          })
          .catch((registrationError) => {
            console.log('SW registro falló:', registrationError);
          });
      });
    }
  }
}