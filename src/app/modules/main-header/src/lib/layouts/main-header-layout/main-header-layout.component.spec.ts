import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ElementRef, Renderer2 } from '@angular/core';
import { AuthButtonLayout } from '@dcx/ui/business-common';
import { MainHeaderLayoutComponent } from './main-header-layout.component';

describe('MainHeaderLayoutComponent', () => {
  let component: MainHeaderLayoutComponent;
  let fixture: ComponentFixture<MainHeaderLayoutComponent>;

  // Mocks
  let mockElementRef: ElementRef<HTMLDivElement>;
  let mockResizeObserver: jasmine.SpyObj<ResizeObserver>;
  let mockNativeElement: any;

  beforeEach(fakeAsync(() => {
    // Mock nativeElement
    mockNativeElement = {
      getBoundingClientRect: jasmine.createSpy('getBoundingClientRect').and.returnValue({ height: 100 }),
    };
    mockElementRef = { nativeElement: mockNativeElement } as ElementRef<HTMLDivElement>;

    // Mock ResizeObserver
    mockResizeObserver = jasmine.createSpyObj('ResizeObserver', ['observe', 'disconnect']);
    (globalThis as any).ResizeObserver = function (cb: any) {
      this.observe = mockResizeObserver.observe;
      this.disconnect = mockResizeObserver.disconnect;
      this.cb = cb;
    };

    TestBed.configureTestingModule({
      imports: [MainHeaderLayoutComponent],
    });
    TestBed.overrideTemplate(MainHeaderLayoutComponent, `<div #mainHeader></div>`);

    fixture = TestBed.createComponent(MainHeaderLayoutComponent);
    component = fixture.componentInstance;

    // Inyecta el ViewChild antes del primer detectChanges
    Object.defineProperty(component, 'mainHeaderRef', {
      value: mockElementRef,
      writable: true,
    });

    fixture.detectChanges(); // ngOnInit + ngAfterViewInit
    tick();
  }));

  afterEach(() => {
    delete (globalThis as any).ResizeObserver;
    document.documentElement.style.removeProperty('--header-height');
    document.documentElement.style.removeProperty('--main-header-offset-height');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngAfterViewInit', () => {
    it('should initialize ResizeObserver, set initial height, update height and evaluate fixed header', () => {
      const setOffsetSpy = spyOn<any>(component, 'setHeaderOffsetHeight').and.callThrough();
      const updateHeightSpy = spyOn<any>(component, 'updateHeaderHeight').and.callThrough();
      const setFixedSpy = spyOn<any>(component, 'setFixedHeader').and.callThrough();

      component.ngAfterViewInit();

      expect(component['resizeObserver']).toBeDefined();
      expect(mockResizeObserver.observe).toHaveBeenCalledWith(mockNativeElement);
      expect(setOffsetSpy).toHaveBeenCalled();
      expect(updateHeightSpy).toHaveBeenCalled();
      expect(setFixedSpy).toHaveBeenCalled();
    });
  });

  describe('onWindowScroll', () => {
    it('should call setFixedHeader on scroll', () => {
      const setFixedSpy = spyOn<any>(component, 'setFixedHeader');

      component.onWindowScroll();

      expect(setFixedSpy).toHaveBeenCalled();
    });
  });

  describe('ngOnDestroy', () => {
    it('should disconnect ResizeObserver and remove CSS variables', () => {
      // Set both CSS variables that should be cleaned up
      document.documentElement.style.setProperty('--header-height', '123px');
      document.documentElement.style.setProperty('--main-header-offset-height', '150px');

      component.ngOnDestroy();

      expect(mockResizeObserver.disconnect).toHaveBeenCalled();
      expect(document.documentElement.style.getPropertyValue('--header-height')).toBe('');
      expect(document.documentElement.style.getPropertyValue('--main-header-offset-height')).toBe('');
    });
  });

  describe('setHeaderOffsetHeight', () => {
    let mockSecondaryNavElement: any;
    let mockSecondaryNavRef: ElementRef<HTMLDivElement>;

    beforeEach(() => {
      mockSecondaryNavElement = {
        getBoundingClientRect: jasmine.createSpy('getBoundingClientRect').and.returnValue({ height: 40 }),
      };
      mockSecondaryNavRef = { nativeElement: mockSecondaryNavElement } as ElementRef<HTMLDivElement>;
    });

    it('should set header offset height for fixed positioning', () => {
      mockNativeElement.getBoundingClientRect.and.returnValue({ height: 120 });
      Object.defineProperty(component, 'secondaryNavRef', {
        value: mockSecondaryNavRef,
        writable: true,
      });

      (component as any)['setHeaderOffsetHeight']();

      expect(document.documentElement.style.getPropertyValue('--main-header-offset-height')).toBe('120px');
      expect(component['secondaryNavHeight']).toBe(40);
    });

    it('should handle missing secondary nav element', () => {
      mockNativeElement.getBoundingClientRect.and.returnValue({ height: 80 });
      Object.defineProperty(component, 'secondaryNavRef', {
        value: undefined,
        writable: true,
      });

      (component as any)['setHeaderOffsetHeight']();

      expect(document.documentElement.style.getPropertyValue('--main-header-offset-height')).toBe('80px');
      expect(component['secondaryNavHeight']).toBe(0);
    });
  });

  describe('setFixedHeader', () => {
    let mockRenderer: jasmine.SpyObj<Renderer2>;

    beforeEach(() => {
      mockRenderer = jasmine.createSpyObj('Renderer2', ['addClass', 'removeClass']);
      Object.defineProperty(component, 'renderer', {
        value: mockRenderer,
        writable: true,
      });
    });

    it('should add body--is-header-fixed class and set isHeaderFixed to true when scrolled past secondary nav', () => {
      component['secondaryNavHeight'] = 50;
      spyOnProperty(globalThis, 'scrollY', 'get').and.returnValue(60);

      (component as any)['setFixedHeader'](mockRenderer, component['secondaryNavHeight']);

      expect(mockRenderer.addClass).toHaveBeenCalledWith(document.body, 'body--is-header-fixed');
      expect(mockRenderer.removeClass).not.toHaveBeenCalled();
      expect(component.isHeaderFixed()).toBe(true);
    });

    it('should remove body--is-header-fixed class and set isHeaderFixed to false when not scrolled past secondary nav', () => {
      component['secondaryNavHeight'] = 50;
      spyOnProperty(globalThis, 'scrollY', 'get').and.returnValue(30);
      component.isHeaderFixed.set(true);

      (component as any)['setFixedHeader'](mockRenderer, component['secondaryNavHeight']);

      expect(mockRenderer.removeClass).toHaveBeenCalledWith(document.body, 'body--is-header-fixed');
      expect(mockRenderer.addClass).not.toHaveBeenCalled();
      expect(component.isHeaderFixed()).toBe(false);
    });

    it('should handle zero secondary nav height', () => {
      component['secondaryNavHeight'] = 0;
      spyOnProperty(globalThis, 'scrollY', 'get').and.returnValue(10);

      (component as any)['setFixedHeader'](mockRenderer, component['secondaryNavHeight']);

      expect(mockRenderer.addClass).toHaveBeenCalledWith(document.body, 'body--is-header-fixed');
      expect(component.isHeaderFixed()).toBe(true);
    });

    it('should handle scroll position at exact secondary nav height boundary', () => {
      component['secondaryNavHeight'] = 50;
      spyOnProperty(globalThis, 'scrollY', 'get').and.returnValue(50);
      component.isHeaderFixed.set(true);

      (component as any)['setFixedHeader'](mockRenderer, component['secondaryNavHeight']);

      expect(mockRenderer.removeClass).toHaveBeenCalledWith(document.body, 'body--is-header-fixed');
      expect(component.isHeaderFixed()).toBe(false);
    });
  });

  describe('updateHeaderHeight', () => {
    it('should not update CSS variable if height is unchanged', () => {
      // Estado inicial dejado por ngAfterViewInit()
      expect(document.documentElement.style.getPropertyValue('--header-height')).toBe('100px');

      // Mismo alto => no debe tocar el CSS ni lastHeight
      component['lastHeight'] = 100;
      mockNativeElement.getBoundingClientRect.and.returnValue({ height: 100 });

      (component as any)['updateHeaderHeight']();

      expect(document.documentElement.style.getPropertyValue('--header-height')).toBe('100px');
      expect(component['lastHeight']).toBe(100);
    });

    it('should update CSS variable when height changes', () => {
      component['lastHeight'] = 100;
      mockNativeElement.getBoundingClientRect.and.returnValue({ height: 120 });

      (component as any)['updateHeaderHeight']();

      expect(document.documentElement.style.getPropertyValue('--header-height')).toBe('120px');
      expect(component['lastHeight']).toBe(120);
    });
  });


  describe('signals and computed', () => {
    let mockRenderer: jasmine.SpyObj<Renderer2>;

    beforeEach(() => {
      mockRenderer = jasmine.createSpyObj('Renderer2', ['addClass', 'removeClass']);
      Object.defineProperty(component, 'renderer', {
        value: mockRenderer,
        writable: true,
      });
    });

    it('should compute authButtonLayout as CONDENSED when header fixed is active', () => {
      component.isMediumViewport.set(false);
      component.isHeaderFixed.set(true);
      fixture.detectChanges();

      expect(component.authButtonLayout()).toBe(AuthButtonLayout.CONDENSED);
    });

    it('should compute authButtonLayout as DEFAULT when header fixed is inactive', () => {
      component.isMediumViewport.set(false);
      component.isHeaderFixed.set(false);
      fixture.detectChanges();

      expect(component.authButtonLayout()).toBe(AuthButtonLayout.DEFAULT);
    });

    it('subMenuOpened defaults to false', () => {
      expect(component.subMenuOpened()).toBeFalse();
    });
  });
});
