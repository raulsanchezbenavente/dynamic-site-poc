import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA, Renderer2 } from '@angular/core';

import { MainHeaderConfig } from '../../models/main-header-config.interface';
import { DATA_INITIAL_VALUE } from '../../stories/data/data-inital-value.fake';
import { BUSINESS_CONFIG, CurrencyFormatPipe } from '@dcx/ui/libs';
import { STORYBOOK_PROVIDERS } from '../../stories/providers/storybook.providers';
import { MainHeaderLayoutToggleComponent } from './main-header-layout-toggle.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { i18nTestingImportsWithMemoryLoader } from '@dcx/ui/storybook-i18n';

describe('MainHeaderLayoutToggleComponent', () => {
  let component: MainHeaderLayoutToggleComponent;
  let fixture: ComponentFixture<MainHeaderLayoutToggleComponent>;
  let mockResizeObserver: jasmine.SpyObj<ResizeObserver>;

  const mockMainHeaderConfig: MainHeaderConfig = DATA_INITIAL_VALUE;

  const BUSINESS_CONFIG_MOCK = {
    culture: 'en-US',
    pointsOfSale: [],
  };

  let originalResizeObserver: any;

  beforeEach(async () => {
    // Mock ResizeObserver
    mockResizeObserver = jasmine.createSpyObj('ResizeObserver', ['observe', 'disconnect']);
    originalResizeObserver = (globalThis as any).ResizeObserver;
    (globalThis as any).ResizeObserver = function (cb: any) {
      this.observe = mockResizeObserver.observe;
      this.disconnect = mockResizeObserver.disconnect;
      this.cb = cb;
    };

    // Mock requestAnimationFrame so code scheduled in ngAfterViewInit runs synchronously in tests
    spyOn(globalThis, 'requestAnimationFrame').and.callFake((cb: FrameRequestCallback) => {
      cb(0);
      return 0 as any;
    });

    spyOn(document.documentElement.style, 'setProperty').and.callThrough();
    spyOn(document.documentElement.style, 'removeProperty').and.callThrough();

    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        MainHeaderLayoutToggleComponent,
        ...i18nTestingImportsWithMemoryLoader({
          'Header.Back': 'Back',
          'Header.Menu': 'Menu',
        }),
      ],
      providers: [
        ...STORYBOOK_PROVIDERS,
        { provide: Renderer2, useValue: jasmine.createSpyObj('Renderer2', ['addClass', 'removeClass', 'setStyle', 'removeStyle']) },
        { provide: BUSINESS_CONFIG, useValue: BUSINESS_CONFIG_MOCK },
        CurrencyFormatPipe,
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(MainHeaderLayoutToggleComponent);
    component = fixture.componentInstance;
    component.config = mockMainHeaderConfig;
    component.ngOnInit();
    fixture.detectChanges();
  });

  afterEach(() => {
    mockResizeObserver.observe.calls.reset();
    mockResizeObserver.disconnect.calls.reset();
    (component as any).resizeObserver = undefined;
    (globalThis as any).ResizeObserver = originalResizeObserver;
    document.documentElement.style.removeProperty('--bottom-menu-height');
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize properties in constructor', () => {
    expect(component.toggleMenuOpen).toBeFalse();
    expect(component.subMenuOpen).toBeFalse();
  });

  it('should call observeSecondaryMenuHeight after view init', fakeAsync(() => {
    // Arrange
    const observeSpy = spyOn(component as any, 'observeSecondaryMenuHeight');

    // Act
    component.ngAfterViewInit();
    tick(); // Process the setTimeout

    expect(observeSpy).toHaveBeenCalled();
  }));

  describe('toggleMenu', () => {
    it('should open the menu', () => {
      // Arrange
      component.toggleMenuOpen = false;

      // Act
      component.toggleMenu();

      // Assert
      expect(component.toggleMenuOpen).toBeTrue();
    });

    it('should close the menu', () => {
      // Arrange
      component.toggleMenuOpen = true;

      // Act
      component.toggleMenu();

      // Assert
      expect(component.toggleMenuOpen).toBeFalse();
    });
  });

  it('should close the submenu when goBackSubMenu is called', () => {
    // Arrange
    component.subMenuOpen = true;

    // Act
    component.goBackSubMenu();

    // Assert
    expect(component.subMenuOpen).toBeFalse();
  });

  it('should update subMenuOpen state when subMenuOpened is called', () => {
    // Act
    component.subMenuOpened(true);

    // Assert
    expect(component.subMenuOpen).toBeTrue();

    // Act
    component.subMenuOpened(false);

    // Assert
    expect(component.subMenuOpen).toBeFalse();
  });

  describe('observeSecondaryMenuHeight', () => {
    it('should set up ResizeObserver when secondaryMenuRef exists', () => {
      // Arrange
      const mockElement = document.createElement('div');
      component.secondaryMenuRef = { nativeElement: mockElement };
      mockResizeObserver.observe.calls.reset();
      mockResizeObserver.disconnect.calls.reset();
      // Act
      (component as any).observeSecondaryMenuHeight();

      // Assert
      expect(mockResizeObserver.observe).toHaveBeenCalledWith(mockElement);
      expect((component as any).resizeObserver.observe).toBeDefined();
      expect((component as any).resizeObserver.disconnect).toBeDefined();
    });

    it('should not set up ResizeObserver when secondaryMenuRef does not exist', () => {
      // Arrange
      component.secondaryMenuRef = undefined as any;
      (component as any).resizeObserver = undefined;
      mockResizeObserver.observe.calls.reset();
      mockResizeObserver.disconnect.calls.reset();

      // Act
      (component as any).observeSecondaryMenuHeight();

      // Assert
      expect(mockResizeObserver.observe).not.toHaveBeenCalled();
    });
  });

  describe('logo visibility logic', () => {
    it('should use mobile logo when logoMobile is set', () => {
      // Arrange
      component.config = {
        ...mockMainHeaderConfig,
        logoMobile: {
          ...mockMainHeaderConfig.logo,
          src: 'mobile-logo.png',
        },
      };

      // Act
      fixture.detectChanges();

      // Assert
      const logoImg = fixture.nativeElement.querySelector('.main-header_logo img');
      expect(logoImg.src).toContain('mobile-logo.png');
    });

    it('should use desktop logo src when logoMobile resolves to desktop logo (resolveConfig fallback)', () => {
      // resolveConfig always sets logoMobile = raw.logoMobile ?? raw.logo, so
      // logoMobile is never undefined at runtime. Simulate that resolved state.
      component.config = {
        ...mockMainHeaderConfig,
        logoMobile: { ...mockMainHeaderConfig.logo, src: 'default-logo.png' },
        logo: { ...mockMainHeaderConfig.logo, src: 'default-logo.png' },
      };

      // Act
      fixture.detectChanges();

      // Assert
      const logoImg = fixture.nativeElement.querySelector('.main-header_logo img');
      expect(logoImg.src).toContain('default-logo.png');
    });
  });

  describe('template rendering conditions', () => {
    it('should show back button when subMenuOpen is true', () => {
      // Arrange
      component.subMenuOpen = true;

      // Act
      fixture.detectChanges();

      // Assert
      const backButton = fixture.nativeElement.querySelector('.main-header_menu_trigger--back');
      expect(backButton).toBeTruthy();
    });

    it('should show toggle button when menu is closed and submenu is closed', () => {
      // Arrange
      component.toggleMenuOpen = false;
      component.subMenuOpen = false;

      // Act
      fixture.detectChanges();

      // Assert
      const toggleButtons = fixture.nativeElement.querySelectorAll('.main-header_menu_trigger--toggle');
      expect(toggleButtons.length).toBeGreaterThan(0);
    });
  });

  describe('CSS classes', () => {
    it('should apply main-header_menu--open class when toggleMenuOpen is true', () => {
      // Arrange
      component.toggleMenuOpen = true;

      // Act
      fixture.detectChanges();

      // Assert
      const header = fixture.nativeElement.querySelector('.main-header');
      expect(header.classList.contains('main-header_menu--open')).toBeTrue();
    });

    it('should remove main-header_menu--open class when toggleMenuOpen is set to false', () => {
      component.toggleMenuOpen = true;
      fixture.detectChanges();
      component.toggleMenuOpen = false;
      fixture.detectChanges();
      const header = fixture.nativeElement.querySelector('.main-header');
      expect(header.classList.contains('main-header_menu--open')).toBeFalse();
    });

    it('should apply main-header_submenu--open class when subMenuOpen is true', () => {
      // Arrange
      component.subMenuOpen = true;

      // Act
      fixture.detectChanges();

      // Assert
      const header = fixture.nativeElement.querySelector('.main-header');
      expect(header.classList.contains('main-header_submenu--open')).toBeTrue();
    });
  });

  describe('event handlers', () => {
    it('should call toggleMenu when toggle button is clicked', () => {
      // Arrange
      spyOn(component, 'toggleMenu');
      component.toggleMenuOpen = false;
      component.subMenuOpen = false;
      fixture.detectChanges();

      // Act
      const toggleButton = fixture.nativeElement.querySelector('.main-header_menu_trigger--toggle');
      toggleButton.click();

      // Assert
      expect(component.toggleMenu).toHaveBeenCalled();
    });

    it('should call goBackSubMenu when back button is clicked', () => {
      // Arrange
      spyOn(component, 'goBackSubMenu');
      component.subMenuOpen = true;
      fixture.detectChanges();

      // Act
      const backButton = fixture.nativeElement.querySelector('.main-header_menu_trigger--back');
      backButton.click();

      // Assert
      expect(component.goBackSubMenu).toHaveBeenCalled();
    });
  });

  describe('accessibility attributes', () => {
    it('should set correct aria-label for toggle button', () => {
      // Arrange
      component.toggleMenuOpen = false;
      component.subMenuOpen = false;

      // Act
      fixture.detectChanges();

      // Assert
      const toggleButton = fixture.nativeElement.querySelector('.main-header_menu_trigger--toggle');
      expect(toggleButton.getAttribute('aria-label')).toBeTruthy();
    });

    it('should set correct aria-label for back button', () => {
      // Arrange
      component.subMenuOpen = true;

      // Act
      fixture.detectChanges();

      // Assert
      const backButton = fixture.nativeElement.querySelector('.main-header_menu_trigger--back');
      expect(backButton.getAttribute('aria-label')).toBeTruthy();
    });
  });

  describe('ngOnDestroy', () => {
    it('should disconnect the observer if it exists', () => {
      // Arrange
      (component as any).resizeObserver = mockResizeObserver;

      // Act
      component.ngOnDestroy();

      // Assert
      expect(mockResizeObserver.disconnect).toHaveBeenCalled();
      expect(document.documentElement.style.removeProperty).toHaveBeenCalledWith('--bottom-menu-height');
    });

    it('should not throw error if observer does not exist', () => {
      // Arrange
      (component as any).resizeObserver = undefined;

      // Act & Assert
      expect(() => component.ngOnDestroy()).not.toThrow();
      expect(document.documentElement.style.removeProperty).toHaveBeenCalledWith('--bottom-menu-height');
    });
  });
});
