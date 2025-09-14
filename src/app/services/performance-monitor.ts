import { Injectable } from '@angular/core';

export interface PerformanceMetrics {
  fcp?: number; // First Contentful Paint
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  ttfb?: number; // Time to First Byte
  loadTime?: number; // Page Load Time
  domContentLoaded?: number; // DOM Content Loaded
}

export interface ResourceTiming {
  name: string;
  duration: number;
  size: number;
  type: string;
}

@Injectable({
  providedIn: 'root'
})
export class PerformanceMonitorService {
  private metrics: PerformanceMetrics = {};
  private resourceTimings: ResourceTiming[] = [];
  private observer?: PerformanceObserver;

  constructor() {
    this.initializeMonitoring();
  }

  /**
   * Inicializa el monitoreo de performance
   */
  private initializeMonitoring() {
    if (typeof window === 'undefined' || !('performance' in window)) {
      return;
    }

    // Monitorear métricas de Core Web Vitals
    this.observeCoreWebVitals();
    
    // Monitorear recursos
    this.observeResourceTimings();
    
    // Monitorear navegación
    this.observeNavigationTiming();
  }

  /**
   * Observa Core Web Vitals
   */
  private observeCoreWebVitals() {
    if (!('PerformanceObserver' in window)) {
      return;
    }

    try {
      // First Contentful Paint
      const fcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint');
        if (fcpEntry) {
          this.metrics.fcp = fcpEntry.startTime;
          this.logMetric('FCP', fcpEntry.startTime);
        }
      });
      fcpObserver.observe({ entryTypes: ['paint'] });

      // Largest Contentful Paint
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        if (lastEntry) {
          this.metrics.lcp = lastEntry.startTime;
          this.logMetric('LCP', lastEntry.startTime);
        }
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

      // First Input Delay
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          const fidEntry = entry as any; // Cast to any for FID-specific properties
          if (fidEntry.processingStart && fidEntry.startTime) {
            const fid = fidEntry.processingStart - fidEntry.startTime;
            this.metrics.fid = fid;
            this.logMetric('FID', fid);
          }
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });

      // Cumulative Layout Shift
      const clsObserver = new PerformanceObserver((list) => {
        let clsValue = 0;
        const entries = list.getEntries();
        entries.forEach(entry => {
          const clsEntry = entry as any; // Cast to any for CLS-specific properties
          if (!clsEntry.hadRecentInput) {
            clsValue += clsEntry.value;
          }
        });
        this.metrics.cls = clsValue;
        this.logMetric('CLS', clsValue);
      });
      
      // Verificar compatibilidad antes de observar
      try {
        if (PerformanceObserver.supportedEntryTypes && PerformanceObserver.supportedEntryTypes.includes('layout-shift')) {
          clsObserver.observe({ entryTypes: ['layout-shift'] });
        } else {
          console.warn('Ignorando entryTypes no compatibles: layout-shift');
        }
      } catch (error) {
        console.warn('entryTypes no válidas; se aborta registro.');
      }

    } catch (error) {
      console.warn('Error observing Core Web Vitals:', error);
    }
  }

  /**
   * Observa timings de recursos
   */
  private observeResourceTimings() {
    if (!('PerformanceObserver' in window)) {
      return;
    }

    try {
      this.observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          if (entry.entryType === 'resource') {
            const resourceEntry = entry as PerformanceResourceTiming;
            this.resourceTimings.push({
              name: resourceEntry.name,
              duration: resourceEntry.duration,
              size: resourceEntry.transferSize || 0,
              type: this.getResourceType(resourceEntry.name)
            });
          }
        });
      });

      this.observer.observe({ entryTypes: ['resource'] });
    } catch (error) {
      console.warn('Error observing resource timings:', error);
    }
  }

  /**
   * Observa timings de navegación
   */
  private observeNavigationTiming() {
    if (!('performance' in window) || !performance.getEntriesByType) {
      return;
    }

    // Esperar a que la página se cargue completamente
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigationEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
        if (navigationEntries.length > 0) {
          const nav = navigationEntries[0];
          
          this.metrics.ttfb = nav.responseStart - nav.requestStart;
          this.metrics.loadTime = nav.loadEventEnd - nav.fetchStart;
          this.metrics.domContentLoaded = nav.domContentLoadedEventEnd - nav.fetchStart;
          
          this.logMetric('TTFB', this.metrics.ttfb);
          this.logMetric('Load Time', this.metrics.loadTime);
          this.logMetric('DOM Content Loaded', this.metrics.domContentLoaded);
        }
      }, 0);
    });
  }

  /**
   * Obtiene el tipo de recurso basado en la URL
   */
  private getResourceType(url: string): string {
    if (url.includes('.js')) return 'script';
    if (url.includes('.css')) return 'stylesheet';
    if (url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/)) return 'image';
    if (url.includes('.woff') || url.includes('.ttf')) return 'font';
    if (url.includes('api/') || url.includes('/api')) return 'api';
    return 'other';
  }

  /**
   * Registra una métrica en consola
   */
  private logMetric(name: string, value: number) {
    const status = this.getMetricStatus(name, value);
    console.log(`🚀 ${name}: ${value.toFixed(2)}ms ${status}`);
  }

  /**
   * Determina el estado de una métrica
   */
  private getMetricStatus(name: string, value: number): string {
    const thresholds: { [key: string]: { good: number; needsImprovement: number } } = {
      'FCP': { good: 1800, needsImprovement: 3000 },
      'LCP': { good: 2500, needsImprovement: 4000 },
      'FID': { good: 100, needsImprovement: 300 },
      'CLS': { good: 0.1, needsImprovement: 0.25 },
      'TTFB': { good: 800, needsImprovement: 1800 }
    };

    const threshold = thresholds[name];
    if (!threshold) return '';

    if (value <= threshold.good) return '✅ Good';
    if (value <= threshold.needsImprovement) return '⚠️ Needs Improvement';
    return '❌ Poor';
  }

  /**
   * Obtiene todas las métricas actuales
   */
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  /**
   * Obtiene los timings de recursos
   */
  getResourceTimings(): ResourceTiming[] {
    return [...this.resourceTimings];
  }

  /**
   * Obtiene métricas de recursos por tipo
   */
  getResourceMetricsByType(): { [type: string]: { count: number; totalSize: number; avgDuration: number } } {
    const metrics: { [type: string]: { count: number; totalSize: number; avgDuration: number } } = {};

    this.resourceTimings.forEach(resource => {
      if (!metrics[resource.type]) {
        metrics[resource.type] = { count: 0, totalSize: 0, avgDuration: 0 };
      }
      
      metrics[resource.type].count++;
      metrics[resource.type].totalSize += resource.size;
      metrics[resource.type].avgDuration += resource.duration;
    });

    // Calcular promedios
    Object.keys(metrics).forEach(type => {
      const metric = metrics[type];
      metric.avgDuration = metric.avgDuration / metric.count;
    });

    return metrics;
  }

  /**
   * Identifica recursos lentos
   */
  getSlowResources(threshold: number = 1000): ResourceTiming[] {
    return this.resourceTimings.filter(resource => resource.duration > threshold);
  }

  /**
   * Identifica recursos grandes
   */
  getLargeResources(threshold: number = 100000): ResourceTiming[] {
    return this.resourceTimings.filter(resource => resource.size > threshold);
  }

  /**
   * Genera un reporte completo de performance
   */
  generateReport(): string {
    const metrics = this.getMetrics();
    const resourceMetrics = this.getResourceMetricsByType();
    const slowResources = this.getSlowResources();
    const largeResources = this.getLargeResources();

    let report = '📊 Performance Report\n';
    report += '==================\n\n';

    // Core Web Vitals
    report += '🎯 Core Web Vitals:\n';
    Object.entries(metrics).forEach(([key, value]) => {
      if (typeof value === 'number') {
        report += `  ${key}: ${value.toFixed(2)}ms ${this.getMetricStatus(key, value)}\n`;
      }
    });

    // Resource Metrics
    report += '\n📦 Resource Metrics:\n';
    Object.entries(resourceMetrics).forEach(([type, metric]) => {
      report += `  ${type}: ${metric.count} resources, ${(metric.totalSize / 1024).toFixed(2)}KB, avg ${metric.avgDuration.toFixed(2)}ms\n`;
    });

    // Slow Resources
    if (slowResources.length > 0) {
      report += '\n🐌 Slow Resources (>1s):\n';
      slowResources.forEach(resource => {
        report += `  ${resource.name}: ${resource.duration.toFixed(2)}ms\n`;
      });
    }

    // Large Resources
    if (largeResources.length > 0) {
      report += '\n📏 Large Resources (>100KB):\n';
      largeResources.forEach(resource => {
        report += `  ${resource.name}: ${(resource.size / 1024).toFixed(2)}KB\n`;
      });
    }

    return report;
  }

  /**
   * Envía métricas a un servicio de analytics (ejemplo)
   */
  sendMetricsToAnalytics(analyticsService?: any) {
    if (!analyticsService) return;

    const metrics = this.getMetrics();
    const resourceMetrics = this.getResourceMetricsByType();

    // Enviar Core Web Vitals
    Object.entries(metrics).forEach(([key, value]) => {
      if (typeof value === 'number') {
        analyticsService.track('performance_metric', {
          metric: key,
          value: value,
          status: this.getMetricStatus(key, value)
        });
      }
    });

    // Enviar métricas de recursos
    Object.entries(resourceMetrics).forEach(([type, metric]) => {
      analyticsService.track('resource_metric', {
        type: type,
        count: metric.count,
        totalSize: metric.totalSize,
        avgDuration: metric.avgDuration
      });
    });
  }

  /**
   * Limpia los datos de performance
   */
  clearMetrics() {
    this.metrics = {};
    this.resourceTimings = [];
  }

  /**
   * Destruye el servicio y limpia observadores
   */
  ngOnDestroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}
