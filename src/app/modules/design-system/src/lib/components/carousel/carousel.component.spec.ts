import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { ResizeSvc } from '@dcx/ui/libs';
import { CarouselComponent } from './carousel.component';
import { CarouselItemDirective } from './directives/carousel-item.directive';
import { By } from '@angular/platform-browser';
import { i18nTestingImportsWithMemoryLoader } from '@dcx/ui/storybook-i18n';

@Component({
  template: `
    <ds-carousel
      [config]="config"
      [totalCarouselItems]="overrideTotal"
      (navigateNext)="onNext($event)"
      (navigatePrev)="onPrev($event)">
      <div carouselItem *ngFor="let i of items" class="item">Item {{ i }}</div>
    </ds-carousel>
  `,
  standalone: true,
  imports: [CommonModule, CarouselComponent, CarouselItemDirective],
})
class HostCarouselTestComponent {
  items = [1, 2, 3, 4, 5, 6];
  overrideTotal: number | null = null;
  config = {
    breakPointConfig: {
      XS: { visibleItems: 2, itemsMargin: 8, itemsToScroll: 1 },
      M:  { visibleItems: 3, itemsMargin: 16, itemsToScroll: 2 },
      L:  { visibleItems: 3, itemsMargin: 16, itemsToScroll: 3 },
    },
    ariaAttributes: { ariaLabel: 'Test Carousel' },
    prev: { ariaAttributes: { ariaLabel: 'Prev slide' } },
    next: { ariaAttributes: { ariaLabel: 'Next slide' } },
  };
  lastNext?: number;
  lastPrev?: number;
  onNext(v: number) { this.lastNext = v; }
  onPrev(v: number) { this.lastPrev = v; }
}

describe('CarouselComponent', () => {
  let fixture: ComponentFixture<HostCarouselTestComponent>;
  let host: HostCarouselTestComponent;
  let carousel: CarouselComponent;
  let layoutSubject: Subject<string>;

  beforeEach(async () => {
    layoutSubject = new Subject<string>();
    const mockResizeSvc: Partial<ResizeSvc> = { layout$: layoutSubject.asObservable() };

    await TestBed.configureTestingModule({
      imports: [
        HostCarouselTestComponent,
        ...i18nTestingImportsWithMemoryLoader({
          'Common.Prev': 'Prev',
          'Common.Next': 'Next',
          'Carousel.Title': 'Carousel',
        }),
      ],
      providers: [{ provide: ResizeSvc, useValue: mockResizeSvc }],
    }).compileComponents();

    fixture = TestBed.createComponent(HostCarouselTestComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();

    const debugEl = fixture.debugElement.query(By.directive(CarouselComponent));
    carousel = debugEl.componentInstance;

    // Force viewport width before initial layout calc
    carousel.viewportRef.nativeElement.style.width = '600px';
    (carousel as any).recalcLayout();
    fixture.detectChanges();
  });

  it('creates host + carousel', () => {
    expect(host).toBeTruthy();
    expect(carousel).toBeTruthy();
  });

  it('derives totalItems from projected content when no override', () => {
    expect((carousel as any).totalItems()).toBe(host.items.length);
    expect(carousel.totalSlides()).toBe(Math.ceil(host.items.length / carousel.visibleItems()));
  });

  it('uses override totalCarouselItems when provided', () => {
    host.overrideTotal = 10;
    fixture.detectChanges();
    (carousel as any).setTotalItems(host.overrideTotal);
    expect((carousel as any).totalItems()).toBe(10);
    expect(carousel.totalSlides()).toBe(Math.ceil(10 / carousel.visibleItems()));
  });

  it('initializes currentSlide=1 & currentIndex=0', () => {
    expect(carousel.currentSlide()).toBe(1);
    expect((carousel as any).currentIndex()).toBe(0);
  });

  it('next() under XS (itemsToScroll=1) keeps slide=1 until boundary', () => {
    layoutSubject.next('XS');
    fixture.detectChanges();

    carousel.next(); // index:1
    expect(host.lastNext).toBe(1);
    expect((carousel as any).currentIndex()).toBe(1);
    expect(carousel.currentSlide()).toBe(1);

    carousel.next(); // index:2
    expect(host.lastNext).toBe(2);
    expect((carousel as any).currentIndex()).toBe(2);
    expect(carousel.currentSlide()).toBe(2);
  });

  it('next() under M scrolls by 2 items', () => {
    layoutSubject.next('M');
    fixture.detectChanges();

    const before = (carousel as any).currentIndex();
    carousel.next(); // +2
    expect((carousel as any).currentIndex()).toBe(before + 2);
    expect(host.lastNext).toBe(1); // still logical slide 1 (index 2 < visibleItems 3)
  });

  it('scrolls by the step even if the resulting viewport is partially filled', () => {
    layoutSubject.next('M');
    fixture.detectChanges();

    const total = (carousel as any).totalItems();
    const maxIndex = Math.max(total - 1, 0);

    carousel.next(); // index: 2
    carousel.next(); // expected to reach 4 instead of clamping to 3

    expect((carousel as any).currentIndex()).toBe(Math.min(4, maxIndex));
    expect(carousel.hasNext()).toBeFalse();
  });

  it('supports full-step jumps that leave a partial final viewport', () => {
    layoutSubject.next('L');
    fixture.detectChanges();

    (carousel as any).setTotalItems(5);
    carousel.resetToFirstSlide();

    carousel.next(); // step = 3, visible = 3

    expect((carousel as any).currentIndex()).toBe(3);
    expect(carousel.hasNext()).toBeFalse();
  });

  it('prev() decreases index respecting itemsToScroll', () => {
    layoutSubject.next('M');
    fixture.detectChanges();

    carousel.next(); // index 2
    const idxAfterNext = (carousel as any).currentIndex();
    carousel.prev(); // back to 0
    expect(host.lastPrev).toBe(1);
    expect((carousel as any).currentIndex()).toBe(idxAfterNext - 2);
    expect(carousel.currentSlide()).toBe(1);
  });

  it('computes transform from currentIndex, item width, and margin', () => {
    (carousel as any).itemWidthPx.set(200);
    (carousel as any).itemsMargin.set(10);
    (carousel as any).currentIndex.set(2);
    expect(carousel.transform()).toBe('translateX(-420px)');
  });

  it('updates CSS vars for visible items and margin after breakpoint change', () => {
    layoutSubject.next('XS');
    fixture.detectChanges();
    const trackEl = carousel.trackRef.nativeElement;
    expect(trackEl.style.getPropertyValue('--carousel-visible-items')).toBe('2');
    expect(trackEl.style.getPropertyValue('--items-margin')).toBe('8px');
  });

  it('resets slide and index on breakpoint change', () => {
    layoutSubject.next('M');
    fixture.detectChanges();
    carousel.next(); // index 2
    expect((carousel as any).currentIndex()).toBe(2);

    layoutSubject.next('XS');
    fixture.detectChanges();
    expect((carousel as any).currentIndex()).toBe(0);
    expect(carousel.currentSlide()).toBe(1);
  });

  it('sets --carousel-item-width after updateItemWidth()', () => {
    (carousel as any).viewportWidth.set(600);
    carousel.visibleItems.set(3);
    (carousel as any).itemsMargin.set(0);
    (carousel as any).updateItemWidth();
    const css = carousel.trackRef.nativeElement.style.getPropertyValue('--carousel-item-width');
    expect(css).toContain('200');
  });

  it('prev() does nothing at start', () => {
    expect((carousel as any).currentIndex()).toBe(0);
    carousel.prev();
    expect((carousel as any).currentIndex()).toBe(0);
    expect(host.lastPrev).toBeUndefined();
  });

  it('next() does nothing when hasNext() is false', () => {
    (carousel as any).setTotalItems(3);
    carousel.visibleItems.set(3);
    fixture.detectChanges();
    expect(carousel.hasNext()).toBeFalse();
    carousel.next();
    expect(host.lastNext).toBeUndefined();
    expect((carousel as any).currentIndex()).toBe(0);
  });

  it('applies transform to track element style on navigation', () => {
    layoutSubject.next('XS');
    fixture.detectChanges();
    (carousel as any).itemWidthPx.set(150);
    (carousel as any).itemsMargin.set(8);
    expect(carousel.transform()).toBe('translateX(-0px)');
    carousel.next(); // index 1 => 1*(150+8)=158
    expect(carousel.transform()).toBe('translateX(-158px)');
  });
});
