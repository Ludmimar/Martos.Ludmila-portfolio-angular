import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef, ElementRef, ViewChild, TrackByFunction } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface VirtualScrollItem {
  id: string | number;
  [key: string]: any;
}

export interface VirtualScrollOptions {
  itemHeight: number;
  containerHeight: number;
  bufferSize?: number;
  threshold?: number;
}

@Component({
  selector: 'app-virtual-scroll',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  template: `
    <div 
      #scrollContainer
      class="virtual-scroll-container"
      [style.height.px]="options.containerHeight"
      (scroll)="onScroll($event)"
      (scrollend)="onScrollEnd($event)">
      
      <!-- Spacer para mantener el scroll height -->
      <div 
        class="virtual-scroll-spacer"
        [style.height.px]="totalHeight">
      </div>
      
      <!-- Items visibles -->
      <div 
        class="virtual-scroll-content"
        [style.transform]="'translateY(' + offsetY + 'px)'">
        
        <div
          *ngFor="let item of visibleItems; trackBy: trackByFn; let i = index"
          class="virtual-scroll-item"
          [style.height.px]="options.itemHeight"
          [attr.data-index]="startIndex + i">
          <ng-content [ngTemplateOutlet]="itemTemplate" [ngTemplateOutletContext]="{ $implicit: item, index: startIndex + i }"></ng-content>
        </div>
      </div>
      
      <!-- Loading indicator -->
      <div *ngIf="isLoading" class="virtual-scroll-loading">
        <div class="spinner"></div>
        <span>Cargando más elementos...</span>
      </div>
    </div>
  `,
  styles: [`
    .virtual-scroll-container {
      position: relative;
      overflow-y: auto;
      overflow-x: hidden;
      border: 1px solid var(--border, #e0e0e0);
      border-radius: var(--radius, 8px);
    }

    .virtual-scroll-spacer {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      pointer-events: none;
    }

    .virtual-scroll-content {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      will-change: transform;
    }

    .virtual-scroll-item {
      display: flex;
      align-items: center;
      padding: 8px 16px;
      border-bottom: 1px solid var(--border-light, #f0f0f0);
      transition: background-color 0.2s ease;
    }

    .virtual-scroll-item:hover {
      background-color: var(--hover-bg, #f8f9fa);
    }

    .virtual-scroll-loading {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
      background: var(--bg, #ffffff);
      border-top: 1px solid var(--border-light, #f0f0f0);
    }

    .spinner {
      width: 20px;
      height: 20px;
      border: 2px solid var(--muted, #666);
      border-top: 2px solid var(--primary, #ff7bac);
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-right: 8px;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    /* Scrollbar styling */
    .virtual-scroll-container::-webkit-scrollbar {
      width: 8px;
    }

    .virtual-scroll-container::-webkit-scrollbar-track {
      background: var(--bg-light, #f1f1f1);
      border-radius: 4px;
    }

    .virtual-scroll-container::-webkit-scrollbar-thumb {
      background: var(--muted, #666);
      border-radius: 4px;
    }

    .virtual-scroll-container::-webkit-scrollbar-thumb:hover {
      background: var(--text, #333);
    }
  `]
})
export class VirtualScrollComponent<T extends VirtualScrollItem> implements OnInit, OnDestroy {
  @Input() items: T[] = [];
  @Input() options: VirtualScrollOptions = { itemHeight: 50, containerHeight: 300 };
  @Input() trackByFn: TrackByFunction<T> = (index: number, item: T) => item.id;
  @Input() itemTemplate!: any; // TemplateRef
  @Input() isLoading: boolean = false;
  @Input() threshold: number = 0.1; // Trigger load more when 10% from bottom

  @Output() loadMore = new EventEmitter<void>();
  @Output() itemClick = new EventEmitter<T>();
  @Output() scrollChange = new EventEmitter<{ scrollTop: number; scrollHeight: number }>();

  @ViewChild('scrollContainer', { static: true }) scrollContainer!: ElementRef<HTMLElement>;

  visibleItems: T[] = [];
  startIndex: number = 0;
  endIndex: number = 0;
  offsetY: number = 0;
  totalHeight: number = 0;
  bufferSize: number = 5;

  private lastScrollTop: number = 0;
  private scrollTimeout?: number;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.bufferSize = this.options.bufferSize || 5;
    this.calculateVisibleItems();
  }

  ngOnDestroy() {
    if (this.scrollTimeout) {
      clearTimeout(this.scrollTimeout);
    }
  }

  ngOnChanges() {
    this.calculateVisibleItems();
  }

  onScroll(event: Event) {
    const target = event.target as HTMLElement;
    const scrollTop = target.scrollTop;
    
    this.lastScrollTop = scrollTop;
    
    // Throttle scroll events
    if (this.scrollTimeout) {
      clearTimeout(this.scrollTimeout);
    }
    
    this.scrollTimeout = window.setTimeout(() => {
      this.handleScroll(scrollTop);
    }, 16); // ~60fps

    this.scrollChange.emit({
      scrollTop: scrollTop,
      scrollHeight: target.scrollHeight
    });
  }

  onScrollEnd(event: Event) {
    const target = event.target as HTMLElement;
    this.handleScroll(target.scrollTop);
  }

  private handleScroll(scrollTop: number) {
    const containerHeight = this.options.containerHeight;
    const itemHeight = this.options.itemHeight;
    const target = this.scrollContainer.nativeElement;
    
    // Calculate visible range
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + this.bufferSize,
      this.items.length
    );
    
    const newStartIndex = Math.max(0, startIndex - this.bufferSize);
    
    if (newStartIndex !== this.startIndex || endIndex !== this.endIndex) {
      this.startIndex = newStartIndex;
      this.endIndex = endIndex;
      this.updateVisibleItems();
    }
    
    // Check if we need to load more items
    this.checkLoadMore(scrollTop, target.scrollHeight, containerHeight);
  }

  private updateVisibleItems() {
    this.visibleItems = this.items.slice(this.startIndex, this.endIndex);
    this.offsetY = this.startIndex * this.options.itemHeight;
    this.cdr.markForCheck();
  }

  private calculateVisibleItems() {
    if (!this.items.length) {
      this.visibleItems = [];
      this.totalHeight = 0;
      return;
    }

    this.totalHeight = this.items.length * this.options.itemHeight;
    
    const containerHeight = this.options.containerHeight;
    const itemHeight = this.options.itemHeight;
    const visibleCount = Math.ceil(containerHeight / itemHeight) + this.bufferSize * 2;
    
    this.endIndex = Math.min(visibleCount, this.items.length);
    this.updateVisibleItems();
  }

  private checkLoadMore(scrollTop: number, scrollHeight: number, containerHeight: number) {
    const distanceFromBottom = scrollHeight - scrollTop - containerHeight;
    const threshold = scrollHeight * this.threshold;
    
    if (distanceFromBottom < threshold && !this.isLoading) {
      this.loadMore.emit();
    }
  }

  // Public methods
  scrollToIndex(index: number) {
    const scrollTop = index * this.options.itemHeight;
    this.scrollContainer.nativeElement.scrollTop = scrollTop;
  }

  scrollToTop() {
    this.scrollContainer.nativeElement.scrollTop = 0;
  }

  scrollToBottom() {
    const scrollTop = this.totalHeight - this.options.containerHeight;
    this.scrollContainer.nativeElement.scrollTop = scrollTop;
  }

  getVisibleRange(): { start: number; end: number } {
    return { start: this.startIndex, end: this.endIndex };
  }

  getScrollPosition(): number {
    return this.scrollContainer.nativeElement.scrollTop;
  }

  // Method to handle item clicks
  onItemClick(item: T) {
    this.itemClick.emit(item);
  }

  // Method to refresh the virtual scroll
  refresh() {
    this.calculateVisibleItems();
  }

  // Method to update items and maintain scroll position
  updateItems(newItems: T[]) {
    const currentScrollTop = this.getScrollPosition();
    this.items = newItems;
    this.calculateVisibleItems();
    
    // Restore scroll position
    setTimeout(() => {
      this.scrollContainer.nativeElement.scrollTop = currentScrollTop;
    }, 0);
  }
}
