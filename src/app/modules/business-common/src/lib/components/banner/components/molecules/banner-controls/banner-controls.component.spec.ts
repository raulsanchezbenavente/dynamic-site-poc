import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { BannerControlsComponent } from './banner-controls.component';
import { BannerControlsConfig } from '../../../models/banner-controls.config.model';
import { BannerAnimationConfig } from '../../../models/banner-animation.config.model';
import { BannerAnimationEffect } from '../../../enums';
import { AccessibilityConfig } from '@dcx/ui/libs';
import { BannerItemConfig } from '../../../models/banner-item.config.model';

describe('BannerControlsComponent', () => {
  let component: BannerControlsComponent;
  let fixture: ComponentFixture<BannerControlsComponent>;

  const mockAccessibilityConfig: AccessibilityConfig = {
    id: 'test-banner',
  };

  const mockItems: BannerItemConfig[] = [
    {
      configuration: {} as any,
      content: {} as any,
      media: {} as any,
      layout: {} as any,
    },
    {
      configuration: {} as any,
      content: {} as any,
      media: {} as any,
      layout: {} as any,
    },
    {
      configuration: {} as any,
      content: {} as any,
      media: {} as any,
      layout: {} as any,
    },
  ];

  const mockConfig: BannerControlsConfig = {
    showControls: true,
    showPagination: true,
    accessibilityConfig: mockAccessibilityConfig,
    items: mockItems,
  };

  const mockAnimation: BannerAnimationConfig = {
    effect: BannerAnimationEffect.FADING,
    cycleTime: 3000,
  };

  function createComponent(config = mockConfig, animation = mockAnimation) {
    const testFixture = TestBed.createComponent(BannerControlsComponent);
    const testComponent = testFixture.componentInstance;
    testComponent.config = config;
    testComponent.animation = animation;
    testFixture.detectChanges();
    return { fixture: testFixture, component: testComponent };
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BannerControlsComponent, TranslateModule.forRoot()],
    }).compileComponents();
  });

  afterEach(() => {
    if (component?.slideInterval) {
      clearInterval(component.slideInterval);
    }
    if (fixture) {
      fixture.destroy();
    }
  });

  it('should create', () => {
    const result = createComponent();
    component = result.component;
    fixture = result.fixture;
    
    expect(component).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should initialize with correct default values', () => {
      const result = createComponent();
      component = result.component;
      fixture = result.fixture;

      expect(component.selectedSlideIndex).toBe(0);
      expect(component.pausedAnimation).toBe(false);
      expect(component.paginationTabIndex).toBe('0');
    });

    it('should set paginationTabIndex to "-1" when showPagination is false', () => {
      const result = createComponent({ ...mockConfig, showPagination: false });
      component = result.component;
      fixture = result.fixture;

      expect(component.paginationTabIndex).toBe('-1');
    });

    it('should create slideInterval for multiple items', () => {
      const result = createComponent();
      component = result.component;
      fixture = result.fixture;

      expect(component.slideInterval).toBeDefined();
    });

    it('should not create slideInterval for single item', () => {
      const result = createComponent({ ...mockConfig, items: [mockItems[0]] });
      component = result.component;
      fixture = result.fixture;

      expect(component.slideInterval).toBeUndefined();
    });
  });

  describe('Slide Navigation', () => {
    beforeEach(() => {
      const result = createComponent();
      component = result.component;
      fixture = result.fixture;
    });

    it('should change slide to specified index', () => {
      spyOn(component.changeIndexEmitter, 'emit');

      component.changeSlide(2);

      expect(component.selectedSlideIndex).toBe(2);
      expect(component.changeIndexEmitter.emit).toHaveBeenCalledWith(2);
    });

    it('should advance to next slide when not at end', () => {
      component.selectedSlideIndex = 0;
      component.changeSlide('next');

      expect(component.selectedSlideIndex).toBe(1);
    });

    it('should wrap to first slide when at end', () => {
      component.selectedSlideIndex = 2;
      component.changeSlide('next');

      expect(component.selectedSlideIndex).toBe(0);
    });

    it('should go to previous slide when not at start', () => {
      component.selectedSlideIndex = 2;
      component.changeSlide('prev');

      expect(component.selectedSlideIndex).toBe(1);
    });

    it('should wrap to last slide when at start', () => {
      component.selectedSlideIndex = 0;
      component.changeSlide('prev');

      expect(component.selectedSlideIndex).toBe(2);
    });
  });

  describe('Pause/Resume Animation', () => {
    beforeEach(() => {
      const result = createComponent();
      component = result.component;
      fixture = result.fixture;
    });

    it('should toggle pausedAnimation state', () => {
      expect(component.pausedAnimation).toBe(false);

      component.manageSlideInterval();
      expect(component.pausedAnimation).toBe(true);

      component.manageSlideInterval();
      expect(component.pausedAnimation).toBe(false);
    });

    it('should emit changePausedEmitter with new state', () => {
      spyOn(component.changePausedEmitter, 'emit');

      component.manageSlideInterval();

      expect(component.changePausedEmitter.emit).toHaveBeenCalledWith(true);
    });
  });

  describe('Sliding Effect', () => {
    it('should apply transform for SLIDING animation', () => {
      const result = createComponent(mockConfig, { ...mockAnimation, effect: BannerAnimationEffect.SLIDING });
      component = result.component;
      fixture = result.fixture;

      const mockElement = document.createElement('div');
      spyOn(document, 'getElementById').and.returnValue(mockElement);

      component.changeSlide(1);

      expect(mockElement.style.transform).toBe('translateX(-100%)');
    });

    it('should not apply transform for FADING animation', () => {
      const result = createComponent();
      component = result.component;
      fixture = result.fixture;

      spyOn(document, 'getElementById');

      component.changeSlide(1);

      expect(document.getElementById).not.toHaveBeenCalled();
    });

    it('should calculate correct transform value for different indices', () => {
      const result = createComponent(mockConfig, { ...mockAnimation, effect: BannerAnimationEffect.SLIDING });
      component = result.component;
      fixture = result.fixture;

      const mockElement = document.createElement('div');
      spyOn(document, 'getElementById').and.returnValue(mockElement);

      component.changeSlide(2);

      expect(mockElement.style.transform).toBe('translateX(-200%)');
    });
  });

  describe('Template Rendering', () => {
    beforeEach(() => {
      const result = createComponent();
      component = result.component;
      fixture = result.fixture;
    });

    it('should render main controls container', () => {
      const container = fixture.nativeElement.querySelector('.banner-controls_inner');
      expect(container).toBeTruthy();
    });

    it('should render play/pause and navigation buttons', () => {
      const playButton = fixture.nativeElement.querySelector('.banner-controls_button-control');
      const prevButton = fixture.nativeElement.querySelector('.banner-controls_button--prev');

      expect(playButton).toBeTruthy();
      expect(prevButton).toBeTruthy();
    });

    it('should render pagination buttons for each item', () => {
      const buttons = fixture.nativeElement.querySelectorAll('.banner-controls_pagination_button');
      expect(buttons.length).toBe(3);
    });

    it('should hide controls when showControls is false', () => {
      const result = createComponent({ ...mockConfig, showControls: false });
      component = result.component;
      fixture = result.fixture;

      const playButton = fixture.nativeElement.querySelector('.banner-controls_button-control');
      const prevButton = fixture.nativeElement.querySelector('.banner-controls_button--prev');

      expect(playButton.classList.contains('hide-visually')).toBe(true);
      expect(prevButton.classList.contains('hide-visually')).toBe(true);
    });

    it('should hide pagination when showPagination is false', () => {
      const result = createComponent({ ...mockConfig, showPagination: false });
      component = result.component;
      fixture = result.fixture;

      const pagination = fixture.nativeElement.querySelector('.banner-controls_pagination');
      expect(pagination.classList.contains('hide-visually')).toBe(true);
    });

    it('should update button class based on pausedAnimation state', () => {
      let button = fixture.nativeElement.querySelector('.banner-controls_button-control');
      expect(button.classList.contains('banner-controls_button-control--pause')).toBe(true);

      component.pausedAnimation = true;
      fixture.detectChanges();
      button = fixture.nativeElement.querySelector('.banner-controls_button-control');
      expect(button.classList.contains('banner-controls_button-control--play')).toBe(true);
    });

    it('should set aria-current on selected pagination button', () => {
      component.selectedSlideIndex = 1;
      fixture.detectChanges();

      const buttons = fixture.nativeElement.querySelectorAll('.banner-controls_pagination_button');
      expect(buttons[0].getAttribute('aria-current')).toBe('false');
      expect(buttons[1].getAttribute('aria-current')).toBe('true');
      expect(buttons[2].getAttribute('aria-current')).toBe('false');
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      const result = createComponent();
      component = result.component;
      fixture = result.fixture;
    });

    it('should set role="group" on controls container', () => {
      const container = fixture.nativeElement.querySelector('.banner-controls_inner');
      expect(container.getAttribute('role')).toBe('group');
    });

    it('should set correct tabindex on pagination buttons', () => {
      const buttons = fixture.nativeElement.querySelectorAll('.banner-controls_pagination_button');
      buttons.forEach((button: any) => {
        expect(button.getAttribute('tabindex')).toBe('0');
      });
    });

    it('should set aria-controls on interactive buttons', () => {
      const playButton = fixture.nativeElement.querySelector('.banner-controls_button-control');
      const prevButton = fixture.nativeElement.querySelector('.banner-controls_button--prev');

      expect(playButton.getAttribute('aria-controls')).toBe('test-banner');
      expect(prevButton.getAttribute('aria-controls')).toBe('test-banner');
    });

    it('should have aria-hidden on decorative icon', () => {
      const icon = fixture.nativeElement.querySelector('.banner-controls_button-control .icon');
      expect(icon.getAttribute('aria-hidden')).toBe('true');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty items array', () => {
      const result = createComponent({ ...mockConfig, items: [] });
      component = result.component;
      fixture = result.fixture;

      const buttons = fixture.nativeElement.querySelectorAll('.banner-controls_pagination_button');
      expect(buttons.length).toBe(0);
    });

    it('should handle rapid navigation', () => {
      const result = createComponent();
      component = result.component;
      fixture = result.fixture;

      component.changeSlide(0);
      component.changeSlide(1);
      component.changeSlide(2);
      component.changeSlide(0);

      expect(component.selectedSlideIndex).toBe(0);
    });
  });
});
