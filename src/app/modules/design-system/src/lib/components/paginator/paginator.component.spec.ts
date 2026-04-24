import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA, signal } from '@angular/core';
import { PaginatorComponent } from './paginator.component';
import { ViewportSizeService } from '@dcx/ui/libs';
import { PaginatorConfig } from './models/paginator.config';
import { i18nTestingImportsWithMemoryLoader } from '@dcx/ui/storybook-i18n';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

describe('PaginatorComponent', () => {
  let fixture: ComponentFixture<PaginatorComponent>;
  let component: PaginatorComponent;
  let viewportSizeServiceMock: jasmine.SpyObj<ViewportSizeService>;

  const setConfig = (cfg: Partial<PaginatorConfig>) => {
    component.config = cfg as PaginatorConfig;
    fixture.detectChanges();
    tick();
  };

  beforeEach(fakeAsync(() => {
    viewportSizeServiceMock = jasmine.createSpyObj<ViewportSizeService>('ViewportSizeService', [
      'getComponentLayoutBreakpoint',
    ]);
    viewportSizeServiceMock.getComponentLayoutBreakpoint.and.returnValue(1024);
    viewportSizeServiceMock.getComponentLayoutBreakpoint.calls?.reset?.();

    TestBed.configureTestingModule({
      imports: [PaginatorComponent, ...i18nTestingImportsWithMemoryLoader({})],
      providers:[
      provideHttpClient(),
      provideHttpClientTesting(),
      { provide: ViewportSizeService, useValue: viewportSizeServiceMock }],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    });

    TestBed.compileComponents();
    tick();

    fixture = TestBed.createComponent(PaginatorComponent);
    component = fixture.componentInstance;
  }));

  it('should create', fakeAsync(() => {
    spyOn<any>(component, 'setIsResponsive').and.callFake(() => {
      (component as any).isResponsive = signal(false) as any; // desktop
      (component as any).itemsToBeDisplayed();
    });

    fixture.detectChanges();
    tick();

    expect(component).toBeTruthy();
  }));

  describe('ngOnInit', () => {
    it('should call internalInit', fakeAsync(() => {
      const spyInit = spyOn<any>(component, 'internalInit').and.callThrough();
      spyOn<any>(component, 'setIsResponsive').and.callFake(() => {
        (component as any).isResponsive = signal(false) as any;
        (component as any).itemsToBeDisplayed();
      });

      fixture.detectChanges();
      tick();

      expect(spyInit).toHaveBeenCalled();
    }));
  });

  describe('itemsToBeDisplayed()', () => {
    beforeEach(fakeAsync(() => {
      spyOn<any>(component, 'setIsResponsive').and.callFake(() => {
        (component as any).isResponsive = signal(false) as any; // desktop for this block
        (component as any).itemsToBeDisplayed();
      });
      fixture.detectChanges();
      tick();
    }));

    it('should clear items when totalPages <= 0', fakeAsync(() => {
      setConfig({ totalPages: 0, currentPage: 1 });
      expect(component.items).toEqual([]);
      expect(component.firstNumberToShow).toBe(0);
      expect(component.lastNumberToShow).toBe(0);
    }));

    it('should normalize currentPage to [1..totalPages]', fakeAsync(() => {
      setConfig({ totalPages: 5, currentPage: 999 });
      expect(component.config.currentPage).toBe(5);

      setConfig({ totalPages: 5, currentPage: 0 });
      expect(component.config.currentPage).toBe(1);
    }));

    it('should set firstNumberToShow and lastNumberToShow correctly', fakeAsync(() => {
      setConfig({ totalPages: 7, currentPage: 4 });
      expect(component.items.length).toBe(7);
      expect(component.firstNumberToShow).toBe(1);
      expect(component.lastNumberToShow).toBe(7);
    }));
  });

  describe('Desktop (isResponsive = false)', () => {
    beforeEach(fakeAsync(() => {
      spyOn<any>(component, 'setIsResponsive').and.callFake(() => {
        (component as any).isResponsive = signal(false) as any; // force desktop
        (component as any).itemsToBeDisplayed();
      });
      fixture.detectChanges(); // triggers ngOnInit -> internalInit -> our spy
      tick();
    }));

    it('should show 1..total when total <= 7', fakeAsync(() => {
      setConfig({ totalPages: 5, currentPage: 3 });
      expect(component.items).toEqual([1, 2, 3, 4, 5]);
    }));

    it('should show [1,2,3,4,5] when current <= 5 and total > 7', fakeAsync(() => {
      setConfig({ totalPages: 10, currentPage: 4 });
      expect(component.items).toEqual([1, 2, 3, 4, 5]);

      setConfig({ totalPages: 10, currentPage: 5 });
      expect(component.items).toEqual([1, 2, 3, 4, 5]);
    }));

    it('should show last 5 pages when current >= total-4', fakeAsync(() => {
      setConfig({ totalPages: 10, currentPage: 6 });
      expect(component.items).toEqual([6, 7, 8, 9, 10]);

      setConfig({ totalPages: 10, currentPage: 9 });
      expect(component.items).toEqual([6, 7, 8, 9, 10]);

      setConfig({ totalPages: 10, currentPage: 10 });
      expect(component.items).toEqual([6, 7, 8, 9, 10]);
    }));

    it('should show [current-1,current,current+1] in the middle range', fakeAsync(() => {
      setConfig({ totalPages: 20, currentPage: 12 });
      expect(component.items).toEqual([11, 12, 13]);
    }));
  });

  describe('Mobile (isResponsive = true)', () => {
    beforeEach(fakeAsync(() => {
      spyOn<any>(component, 'setIsResponsive').and.callFake(() => {
        (component as any).isResponsive = signal(true) as any; // force mobile
        (component as any).itemsToBeDisplayed();
      });
      fixture.detectChanges(); // triggers ngOnInit -> internalInit -> our spy
      tick();
    }));

    it('should show 1..total when total <= 3', fakeAsync(() => {
      setConfig({ totalPages: 3, currentPage: 2 });
      expect(component.items).toEqual([1, 2, 3]);
    }));

    it('should show [1,2,3] at the start', fakeAsync(() => {
      setConfig({ totalPages: 8, currentPage: 1 });
      expect(component.items).toEqual([1, 2, 3]);

      setConfig({ totalPages: 8, currentPage: 2 });
      expect(component.items).toEqual([1, 2, 3]);
    }));

    it('should show [total-2,total-1,total] at the end', fakeAsync(() => {
      setConfig({ totalPages: 8, currentPage: 7 });
      expect(component.items).toEqual([6, 7, 8]);

      setConfig({ totalPages: 8, currentPage: 8 });
      expect(component.items).toEqual([6, 7, 8]);
    }));

    it('should show [current-1,current,current+1] in the middle range', fakeAsync(() => {
      setConfig({ totalPages: 10, currentPage: 5 });
      expect(component.items).toEqual([4, 5, 6]);
    }));
  });

  describe('Events and navigation', () => {
    beforeEach(fakeAsync(() => {
      spyOn<any>(component, 'setIsResponsive').and.callFake(() => {
        (component as any).isResponsive = signal(false) as any; // desktop
        (component as any).itemsToBeDisplayed();
      });
      fixture.detectChanges();
      tick();
    }));

    it('should advance onNext if not on last page', fakeAsync(() => {
      const emitSpy = spyOn(component.selectPageEmitter, 'emit');
      setConfig({ totalPages: 4, currentPage: 2 });

      component.onNext();
      tick();

      expect(component.config.currentPage).toBe(3);
      expect(emitSpy).toHaveBeenCalledWith(3);
    }));

    it('should do nothing onNext if already on last page', fakeAsync(() => {
      const emitSpy = spyOn(component.selectPageEmitter, 'emit');
      setConfig({ totalPages: 4, currentPage: 4 });

      component.onNext();
      tick();

      expect(component.config.currentPage).toBe(4);
      expect(emitSpy).not.toHaveBeenCalled();
    }));

    it('should retrocede onPrevious if not on first page', fakeAsync(() => {
      const emitSpy = spyOn(component.selectPageEmitter, 'emit');
      setConfig({ totalPages: 4, currentPage: 3 });

      component.onPrevious();
      tick();

      expect(component.config.currentPage).toBe(2);
      expect(emitSpy).toHaveBeenCalledWith(2);
    }));

    it('should do nothing onPrevious if already on first page', fakeAsync(() => {
      const emitSpy = spyOn(component.selectPageEmitter, 'emit');
      setConfig({ totalPages: 4, currentPage: 1 });

      component.onPrevious();
      tick();

      expect(component.config.currentPage).toBe(1);
      expect(emitSpy).not.toHaveBeenCalled();
    }));
  });

  describe('internalInit / setIsResponsive', () => {
    it('internalInit invokes setIsResponsive', fakeAsync(() => {
      const setRespSpy = spyOn<any>(component, 'setIsResponsive').and.callFake(() => {
        (component as any).isResponsive = signal(false) as any;
        (component as any).itemsToBeDisplayed();
      });

      component['internalInit']();
      tick();

      expect(setRespSpy).toHaveBeenCalled();
    }));
  });
});
