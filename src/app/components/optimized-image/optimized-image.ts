import { Component, Input, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageOptimizationService, ImageOptimizationOptions } from '../../services/image-optimization';

@Component({
  selector: 'app-optimized-image',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  template: `
    <div class="image-container" [class.loading]="isLoading" [class.error]="hasError">
      <img
        #imageElement
        [src]="currentSrc"
        [alt]="alt"
        [class]="imageClass"
        [loading]="lazy ? 'lazy' : 'eager'"
        [decoding]="decoding"
        [style.width.px]="width"
        [style.height.px]="height"
        (load)="onImageLoad()"
        (error)="onImageError()"
        [attr.aria-hidden]="alt ? 'false' : 'true'"
        [attr.role]="alt ? 'img' : 'presentation'"
      />
      
      <!-- Placeholder mientras carga -->
      <div *ngIf="isLoading && showPlaceholder" class="image-placeholder">
        <div class="placeholder-content">
          <div class="spinner"></div>
          <span class="placeholder-text">Cargando imagen...</span>
        </div>
      </div>
      
      <!-- Error state -->
      <div *ngIf="hasError" class="image-error">
        <div class="error-content">
          <i class="fa-solid fa-image" aria-hidden="true"></i>
          <span class="error-text">Error al cargar imagen</span>
          <button class="retry-btn" (click)="retryLoad()" aria-label="Reintentar carga de imagen">
            <i class="fa-solid fa-refresh" aria-hidden="true"></i>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .image-container {
      position: relative;
      display: inline-block;
      overflow: hidden;
      background: var(--bg, #f8f9fa);
      border-radius: var(--radius, 8px);
    }

    .image-container img {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: opacity 0.3s ease;
    }

    .image-container.loading img {
      opacity: 0;
    }

    .image-container.loaded img {
      opacity: 1;
    }

    .image-placeholder {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--bg, #f8f9fa);
      color: var(--muted, #666);
    }

    .placeholder-content {
      text-align: center;
    }

    .spinner {
      width: 24px;
      height: 24px;
      border: 2px solid var(--muted, #666);
      border-top: 2px solid var(--primary, #ff7bac);
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 8px;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .placeholder-text {
      font-size: 12px;
      color: var(--muted, #666);
    }

    .image-error {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--bg, #f8f9fa);
      color: var(--error, #dc3545);
    }

    .error-content {
      text-align: center;
    }

    .error-content i {
      font-size: 24px;
      margin-bottom: 8px;
      display: block;
    }

    .error-text {
      font-size: 12px;
      display: block;
      margin-bottom: 8px;
    }

    .retry-btn {
      background: var(--primary, #ff7bac);
      color: white;
      border: none;
      border-radius: 4px;
      padding: 4px 8px;
      cursor: pointer;
      font-size: 12px;
      transition: background 0.2s;
    }

    .retry-btn:hover {
      background: var(--accent, #ffc7d2);
    }

    .retry-btn i {
      margin: 0;
    }
  `]
})
export class OptimizedImageComponent implements OnInit, OnDestroy {
  @Input() src!: string;
  @Input() alt: string = '';
  @Input() width?: number;
  @Input() height?: number;
  @Input() lazy: boolean = true;
  @Input() decoding: 'sync' | 'async' | 'auto' = 'async';
  @Input() imageClass: string = '';
  @Input() showPlaceholder: boolean = true;
  @Input() optimizationOptions: ImageOptimizationOptions = {};

  @ViewChild('imageElement', { static: false }) imageElement?: ElementRef<HTMLImageElement>;

  currentSrc: string = '';
  isLoading: boolean = true;
  hasError: boolean = false;
  retryCount: number = 0;
  maxRetries: number = 3;

  private intersectionObserver: IntersectionObserver | null = null;
  private isIntersecting: boolean = false;

  constructor(
    private imageOptimizationService: ImageOptimizationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.initializeImage();
  }

  ngOnDestroy() {
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
    }
  }

  private initializeImage() {
    if (this.lazy) {
      this.setupLazyLoading();
    } else {
      this.loadImage();
    }
  }

  private setupLazyLoading() {
    this.intersectionObserver = this.imageOptimizationService.createLazyLoader((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !this.isIntersecting) {
          this.isIntersecting = true;
          this.loadImage();
        }
      });
    });

    if (this.intersectionObserver && this.imageElement) {
      this.intersectionObserver.observe(this.imageElement.nativeElement);
    }
  }

  private loadImage() {
    this.isLoading = true;
    this.hasError = false;
    this.cdr.markForCheck();

    // Optimizar la imagen
    this.currentSrc = this.imageOptimizationService.optimizeImage(this.src, {
      ...this.optimizationOptions,
      width: this.width,
      height: this.height
    });

    // Si la imagen ya está en cache, cargar inmediatamente
    if (this.imageOptimizationService.isImageCached(this.currentSrc)) {
      this.onImageLoad();
    }
  }

  onImageLoad() {
    this.isLoading = false;
    this.hasError = false;
    this.retryCount = 0;
    this.cdr.markForCheck();

    // Disconnect observer después de cargar
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
    }
  }

  onImageError() {
    this.hasError = true;
    this.isLoading = false;
    this.cdr.markForCheck();

    // Log error solo si no es un error de parámetros de consulta o si es una imagen local
    if (this.currentSrc && !this.currentSrc.includes('?q=') && !this.currentSrc.includes('&f=')) {
      // Solo mostrar error si es una imagen local que debería existir
      if (this.src.startsWith('assets/') || this.src.startsWith('./assets/')) {
        console.warn(`Failed to load image: ${this.currentSrc}`);
      }
    } else if (this.currentSrc && (this.currentSrc.includes('?q=') || this.currentSrc.includes('&f='))) {
      // Si falla con parámetros de optimización, intentar sin ellos
      if (this.retryCount === 0) {
        console.warn(`Failed to load optimized image, retrying without optimization: ${this.src}`);
        this.currentSrc = this.src; // Usar src original sin optimización
        this.cdr.markForCheck();
        return;
      }
    }
  }

  retryLoad() {
    if (this.retryCount < this.maxRetries) {
      this.retryCount++;
      this.loadImage();
    } else {
      console.error(`Max retries exceeded for image: ${this.src}`);
    }
  }

  // Método público para recargar imagen
  reload() {
    this.retryCount = 0;
    this.loadImage();
  }

  // Método público para cambiar src
  updateSrc(newSrc: string) {
    this.src = newSrc;
    this.loadImage();
  }
}
