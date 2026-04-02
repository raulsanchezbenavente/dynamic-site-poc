import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SkeletonBannerComponent } from './skeleton-banner.component';
import { SkeletonComponent } from '@dcx/storybook/design-system';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

describe('SkeletonBannerComponent', () => {
  let component: SkeletonBannerComponent;
  let fixture: ComponentFixture<SkeletonBannerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SkeletonBannerComponent, SkeletonComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SkeletonBannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the skeleton banner container', () => {
    const containerElement: HTMLElement = fixture.nativeElement.querySelector('.skeleton-banner');
    expect(containerElement).toBeTruthy();
  });

  it('should render the skeleton banner item', () => {
    const itemElement: HTMLElement = fixture.nativeElement.querySelector('.skeleton-banner_item');
    expect(itemElement).toBeTruthy();
  });

  it('should render ds-skeleton component', () => {
    const skeletonDebugElement: DebugElement = fixture.debugElement.query(By.css('ds-skeleton'));
    expect(skeletonDebugElement).toBeTruthy();
  });

  it('should have correct structure with nested divs', () => {
    const containerElement: HTMLElement = fixture.nativeElement.querySelector('.skeleton-banner');
    const itemElement: HTMLElement | null = containerElement?.querySelector('.skeleton-banner_item');
    expect(itemElement).toBeTruthy();
    expect(itemElement?.parentElement).toBe(containerElement);
  });
});
