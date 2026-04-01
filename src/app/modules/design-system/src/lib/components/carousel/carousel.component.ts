import {
  AfterContentInit,
  AfterViewInit,
  Component,
  computed,
  ContentChildren,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  input,
  NgZone,
  OnInit,
  output,
  QueryList,
  signal,
  ViewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ResizeSvc, SliderBreakpointsConfig } from '@dcx/ui/libs';
import { TranslateModule } from '@ngx-translate/core';

import { CarouselItemDirective } from './directives/carousel-item.directive';
import { CarouselConfig } from './models/carousel.config';

/**
 * Responsive carousel component.
 * - Projects items via [carouselItem].
 * - Can accept an external total override (totalCarouselItems) when parent knows the item count ahead of projection.
 * - Adjusts visible items, margin and scroll step based on provided breakpoint config.
 */
@Component({
  selector: 'ds-carousel',
  templateUrl: './carousel.component.html',
  styleUrl: './styles/carousel.styles.scss',
  imports: [TranslateModule],
  standalone: true,
})
export class CarouselComponent implements OnInit, AfterViewInit, AfterContentInit {
  @ViewChild('track', { static: true }) public trackRef!: ElementRef<HTMLDivElement>;
  @ViewChild('viewport', { static: true }) public viewportRef!: ElementRef<HTMLDivElement>;
  @ContentChildren(CarouselItemDirective) public items!: QueryList<CarouselItemDirective>;

  public readonly config = input.required<CarouselConfig>();

  // Emits the current slide index (1-based) on navigation
  public readonly navigatePrev = output<number>();
  public readonly navigateNext = output<number>();

  /**
   * Computes the horizontal translateX applied to the items track.
   *
   * Formula:
   *   offsetPx = currentIndex * (itemWidthPx + itemsMargin)
   *
   * Where:
   *   currentIndex → zero-based index of the first item currently in view.
   *   itemWidthPx  → calculated width per item in pixels (excluding the margin), recalculated on resize/breakpoint.
   *   itemsMargin  → horizontal gap between consecutive items (px).
   *
   * The resulting CSS transform keeps the visible window aligned when:
   * - Breakpoints change (visible items / margin / scroll step).
   * - The number of items updates.
   * - Navigation moves forward/backward by a variable scroll step.
   *
   * Returned value: `translateX(-<offsetPx>px)`
   */
  public transform = computed(() => {
    const index = this.currentIndex();
    const itemWidth = this.itemWidthPx();
    const margin = this.itemsMargin();

    const offset = index * (itemWidth + margin);
    return `translateX(-${offset}px)`;
  });

  /**
   * Optional total item override.
   * Used only when the parent knows the total number of carousel items ahead of projection.
   * Typically required in async or virtualized scenarios.
   *
   * When not provided, the component derives total count automatically from projected content.
   */
  public totalCarouselItems = input<number | null>(null);

  public visibleItems = signal(3);

  // Current visible "view" of the carousel, derived from index and visibleItems.
  public readonly currentSlide = signal(1);

  // Total logical slides: how many full views fit with the current visibleItems count.
  public readonly totalSlides = computed(() => Math.ceil(this.totalItems() / this.visibleItems()));

  public hasPrev = computed(() => this.currentIndex() > 0);
  public hasNext = computed(() => {
    const total = this.totalItems();
    const visible = this.visibleItems();
    const lastStartIndex = Math.max(total - visible, 0);
    return this.currentIndex() < lastStartIndex;
  });

  private resizeScheduled = false;

  private readonly viewportWidth = signal(0);
  private readonly itemWidthPx = signal(0);
  private readonly itemsToScroll = signal(1);
  private readonly itemsMargin = signal(16);
  private readonly totalItems = signal(0);
  private readonly currentIndex = signal(0);

  private readonly resizeService = inject(ResizeSvc);
  private readonly destroyRef = inject(DestroyRef);
  private readonly ngZone = inject(NgZone);

  constructor() {
    effect(() => {
      const override = this.totalCarouselItems();

      if (override === null) {
        this.updateTotalItemsFromContent();
      } else {
        this.setTotalItems(override);
      }
    });
  }

  public ngOnInit(): void {
    this.internalInit();
  }

  public ngAfterContentInit(): void {
    // If no external override, derive total from projected items.
    if (this.totalCarouselItems() == null) {
      this.updateTotalItemsFromContent();
    }

    // Recalculate if projected content changes dynamically.
    this.items.changes.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      if (this.totalCarouselItems() == null) {
        this.updateTotalItemsFromContent();
      }
    });
  }

  public ngAfterViewInit(): void {
    this.resetToFirstSlide();
    this.setVisibleItemsProperty();
    this.setItemsMarginProperty();

    this.recalcLayout();
    this.observeViewportResize();
  }

  /** Resets the carousel to its initial position. Useful after breakpoint changes or data reloads. */
  public resetToFirstSlide(): void {
    this.currentSlide.set(1);
    this.currentIndex.set(0);
  }

  public next(): void {
    if (this.hasNext()) {
      const step = this.itemsToScroll();
      const total = this.totalItems();
      const maxIndex = Math.max(total - 1, 0);

      let newIndex = this.currentIndex() + step;
      if (newIndex > maxIndex) {
        newIndex = maxIndex;
      }

      this.currentIndex.set(newIndex);

      const slide = Math.floor(newIndex / this.visibleItems()) + 1;
      this.currentSlide.set(slide);
      this.navigateNext.emit(slide);

      this.recalcLayoutDeferred();
    }
  }

  public prev(): void {
    if (this.hasPrev()) {
      const step = this.itemsToScroll();
      const newIndex = Math.max(this.currentIndex() - step, 0);
      this.currentIndex.set(newIndex);

      const slide = Math.floor(newIndex / this.visibleItems()) + 1;
      this.currentSlide.set(slide);
      this.navigatePrev.emit(slide);

      this.recalcLayoutDeferred();
    }
  }

  /**
   * Handles viewport resize events detected by ResizeObserver.
   * - Throttled by requestAnimationFrame to prevent layout thrashing.
   * - Runs layout recalculation inside Angular's zone (for signal updates or style bindings).
   * - Called automatically when the viewport container changes size.
   */
  private readonly handleViewportResize = (): void => {
    if (this.resizeScheduled) return;
    this.resizeScheduled = true;

    requestAnimationFrame(() => {
      this.resizeScheduled = false;
      this.ngZone.run(() => this.recalcLayout());
    });
  };

  /**
   * Observes changes in the local viewport element using ResizeObserver.
   * This complements global breakpoint updates from ResizeSvc by reacting
   * to actual container size changes (e.g., when carousel buttons appear/disappear).
   *
   * Implementation notes:
   * - Executed outside Angular's zone to avoid triggering change detection
   *   on every DOM resize event.
   * - Only re-enters the zone when recalculation is explicitly required.
   * - Automatically cleans up the observer when the component is destroyed.
   */
  private observeViewportResize(): void {
    const viewportEl = this.viewportRef.nativeElement;

    this.ngZone.runOutsideAngular(() => {
      const observer = new ResizeObserver(this.handleViewportResize);
      observer.observe(viewportEl);

      // Ensure proper teardown when the component is destroyed.
      this.destroyRef.onDestroy(() => observer.disconnect());
    });
  }

  /** Recalculates current viewport and item width. */
  private recalcLayout(): void {
    this.updateViewportWidth();
    this.updateItemWidth();
  }

  /** Defers recalculation to the next animation frame for smoother UI transitions. */
  private recalcLayoutDeferred(): void {
    requestAnimationFrame(() => this.recalcLayout());
  }

  private internalInit(): void {
    this.subscribeToResize();
  }

  /** Subscribes to ResizeSvc layout$ to update breakpoints and layout dynamically. */
  private subscribeToResize(): void {
    if (this.config().breakPointConfig) {
      this.resizeService.layout$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((size) => {
        const breakpointConfig = this.config().breakPointConfig![size as keyof SliderBreakpointsConfig];

        const margin = breakpointConfig?.itemsMargin ?? this.itemsMargin();
        const newVisibleItems = breakpointConfig?.visibleItems as number;
        const step = breakpointConfig?.itemsToScroll ?? 1;

        if (newVisibleItems) {
          this.visibleItems.set(newVisibleItems);
          this.setVisibleItemsProperty();
        }

        this.itemsMargin.set(margin);
        this.setItemsMarginProperty();

        this.itemsToScroll.set(step);

        // Reset paging when layout changes (avoid landing on an invalid position).
        this.currentSlide.set(1);
        this.currentIndex.set(0);

        this.updateViewportWidth();
        this.updateItemWidth();
      });
    }
  }

  private updateViewportWidth(): void {
    const width = this.viewportRef.nativeElement.clientWidth;
    this.viewportWidth.set(width);
  }

  private updateItemWidth(): void {
    const viewport = this.viewportWidth();
    const visible = this.visibleItems();
    const margin = this.itemsMargin();
    if (!viewport || !visible) {
      return;
    }

    // Real width for each item in px
    const totalMargins = margin * (visible - 1);
    const itemWidth = (viewport - totalMargins) / visible;
    this.itemWidthPx.set(itemWidth);

    this.trackRef.nativeElement.style.setProperty('--carousel-item-width', `${itemWidth}px`);
  }

  private updateTotalItemsFromContent(): void {
    const count = this.items ? this.items.length : 0;
    this.setTotalItems(count);
  }

  private setVisibleItemsProperty(): void {
    // Expose visible items as a CSS variable for layout/styling hooks.
    const visible = this.visibleItems();
    this.trackRef.nativeElement.style.setProperty('--carousel-visible-items', visible.toString());
  }

  private setItemsMarginProperty(): void {
    // Expose items margin as a CSS variable so SCSS can space items by breakpoint.
    const margin = this.itemsMargin();
    this.trackRef.nativeElement.style.setProperty('--items-margin', `${margin}px`);
  }

  private setTotalItems(count: number): void {
    this.totalItems.set(count);
  }
}
