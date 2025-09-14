import { Injectable } from '@angular/core';

export interface ImageOptimizationOptions {
  quality?: number;
  format?: 'webp' | 'avif' | 'jpeg' | 'png';
  width?: number;
  height?: number;
  lazy?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ImageOptimizationService {
  private readonly WEBP_SUPPORTED = this.checkWebPSupport();
  private readonly AVIF_SUPPORTED = this.checkAVIFSupport();
  private readonly INTERSECTION_OBSERVER_SUPPORTED = 'IntersectionObserver' in window;

  constructor() {}

  /**
   * Optimiza una imagen según las capacidades del navegador
   */
  optimizeImage(src: string, options: ImageOptimizationOptions = {}): string {
    const {
      quality = 80,
      format = 'webp',
      width,
      height,
      lazy = true
    } = options;

    // Si es una imagen externa (GitHub, etc.), devolver tal como está
    if (this.isExternalImage(src)) {
      return src;
    }

    // Si es una imagen local sin optimización disponible, devolver tal como está
    if (this.isLocalImageWithoutOptimization(src)) {
      return src;
    }

    // Determinar el mejor formato soportado
    const bestFormat = this.getBestSupportedFormat(format);
    
    // Construir URL optimizada
    let optimizedSrc = src;
    
    // Solo agregar parámetros de optimización si el servidor los soporta
    if (this.supportsImageOptimization(src) && (width || height || quality !== 80)) {
      const params = new URLSearchParams();
      if (width) params.set('w', width.toString());
      if (height) params.set('h', height.toString());
      if (quality !== 80) params.set('q', quality.toString());
      if (bestFormat !== 'jpeg') params.set('f', bestFormat);
      
      optimizedSrc += `?${params.toString()}`;
    }

    return optimizedSrc;
  }

  /**
   * Crea un IntersectionObserver para lazy loading
   */
  createLazyLoader(callback: (entries: IntersectionObserverEntry[]) => void): IntersectionObserver | null {
    if (!this.INTERSECTION_OBSERVER_SUPPORTED) {
      // Fallback: cargar inmediatamente
      callback([]);
      return null;
    }

    return new IntersectionObserver(callback, {
      rootMargin: '50px 0px',
      threshold: 0.1
    });
  }

  /**
   * Precarga imágenes críticas
   */
  preloadCriticalImages(imageUrls: string[]): Promise<void[]> {
    const preloadPromises = imageUrls.map(url => this.preloadImage(url));
    return Promise.all(preloadPromises);
  }

  /**
   * Precarga una imagen individual
   */
  private preloadImage(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = () => reject(new Error(`Failed to preload image: ${src}`));
      img.src = src;
    });
  }

  /**
   * Genera srcset para imágenes responsivas
   */
  generateSrcSet(baseSrc: string, sizes: number[]): string {
    if (this.isExternalImage(baseSrc)) {
      return baseSrc;
    }

    return sizes
      .map(size => `${this.optimizeImage(baseSrc, { width: size })} ${size}w`)
      .join(', ');
  }

  /**
   * Verifica si una imagen es externa
   */
  private isExternalImage(src: string): boolean {
    return src.startsWith('http') || src.startsWith('//');
  }

  /**
   * Verifica si es una imagen local sin optimización disponible
   */
  private isLocalImageWithoutOptimization(src: string): boolean {
    // Para desarrollo local, no aplicar optimización a imágenes estáticas
    if (src.startsWith('assets/') || src.startsWith('./assets/')) {
      return true;
    }
    return false;
  }

  /**
   * Verifica si el servidor soporta optimización de imágenes
   */
  private supportsImageOptimization(src: string): boolean {
    // En desarrollo local, no hay servidor de optimización
    if (src.startsWith('assets/') || src.startsWith('./assets/')) {
      return false;
    }
    // Para imágenes externas o CDN, asumir que soportan optimización
    return this.isExternalImage(src);
  }

  /**
   * Determina el mejor formato soportado por el navegador
   */
  private getBestSupportedFormat(preferredFormat: string): string {
    if (preferredFormat === 'avif' && this.AVIF_SUPPORTED) {
      return 'avif';
    }
    if (preferredFormat === 'webp' && this.WEBP_SUPPORTED) {
      return 'webp';
    }
    return 'jpeg';
  }

  /**
   * Verifica soporte para WebP
   */
  private checkWebPSupport(): boolean {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  }

  /**
   * Verifica soporte para AVIF
   */
  private checkAVIFSupport(): boolean {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL('image/avif').indexOf('data:image/avif') === 0;
  }

  /**
   * Optimiza imágenes en batch
   */
  optimizeImageBatch(images: Array<{ src: string; options?: ImageOptimizationOptions }>): string[] {
    return images.map(({ src, options }) => this.optimizeImage(src, options));
  }

  /**
   * Calcula el tamaño de imagen óptimo basado en el viewport
   */
  calculateOptimalSize(containerWidth: number, devicePixelRatio: number = 1): number {
    const optimalWidth = containerWidth * devicePixelRatio;
    
    // Redondear a múltiplos de 100 para mejor compresión
    return Math.ceil(optimalWidth / 100) * 100;
  }

  /**
   * Genera placeholder para imágenes
   */
  generatePlaceholder(width: number, height: number, color: string = '#f0f0f0'): string {
    const svg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="${color}"/>
        <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#999" font-family="Arial, sans-serif" font-size="14">
          Cargando...
        </text>
      </svg>
    `;
    
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  }

  /**
   * Verifica si una imagen está en cache del navegador
   */
  isImageCached(src: string): boolean {
    const img = new Image();
    img.src = src;
    return img.complete && img.naturalWidth > 0;
  }

  /**
   * Limpia cache de imágenes (útil para desarrollo)
   */
  clearImageCache(): void {
    // Esto es más útil para desarrollo
    if (typeof window !== 'undefined' && 'caches' in window) {
      caches.keys().then(cacheNames => {
        cacheNames.forEach(cacheName => {
          if (cacheName.includes('image')) {
            caches.delete(cacheName);
          }
        });
      });
    }
  }
}
