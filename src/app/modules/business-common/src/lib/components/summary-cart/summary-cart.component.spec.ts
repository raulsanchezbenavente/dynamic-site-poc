import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ChangeDetectorRef, NO_ERRORS_SCHEMA, Renderer2 } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of, Subject } from 'rxjs';

import { SummaryCartComponent } from './summary-cart.component';

import {
  LoggerService,
  SessionData,
  ViewportSizeService,
  Booking,
  SessionStore,
  EnumStorageKey,
} from '@dcx/ui/libs';
import { Booking as ApiBooking } from '@dcx/ui/api-layer';
import { TranslateService } from '@ngx-translate/core';

import { SUMMARY_CART_BUILDER_SERVICE } from './tokens/injection-tokens';
import { CHECK_IN_SUMMARY_BUILDER } from '../../../../../check-in-summary/src/lib/tokens/injection-tokens';
import { SummaryCardBuilderInterface } from './interfaces/summary-cart-builder.interface';
import { SummaryCartConfig } from './models/summary-cart.config';
import { SummaryCartButtonConfig } from './components/summary-cart-button/models/summary-cart-button.config';
import { BookingMapperService } from './services/booking-mapper.service';
import { SharedSessionService } from './services/shared-session.service';
import { StorageService } from '@dcx/ui/libs';
import { CarriersRepositoryService, CarrierMapperService, JourneyEnricherService } from '../../services';

const sessionStoreMock = {};

describe('SummaryCartComponent', () => {
  let fixture: ComponentFixture<SummaryCartComponent>;
  let component: SummaryCartComponent;
  let sharedSessionSubject: Subject<SessionData>;
  let mqlTrigger: (matches: boolean) => void;

  const loggerServiceMock = jasmine.createSpyObj<LoggerService>('LoggerService', ['error']);
  const viewportSizeServiceMock = jasmine.createSpyObj<ViewportSizeService>('ViewportSizeService', [
    'getComponentLayoutBreakpoint',
  ]);
  const builderServiceMock = jasmine.createSpyObj<SummaryCardBuilderInterface>('SummaryCardBuilderService', ['getData']);
  const bookingMapperServiceMock = jasmine.createSpyObj<BookingMapperService>('BookingMapperService', ['mapIfNeeded']);
  const storageServiceMock = jasmine.createSpyObj<StorageService>('StorageService', ['getSessionStorage']);
  const journeyEnricherServiceMock = jasmine.createSpyObj<JourneyEnricherService>('JourneyEnricherService', ['enrichJourneysWithStatus']);
  const carriersRepositoryServiceMock = jasmine.createSpyObj<CarriersRepositoryService>('CarriersRepositoryService', ['getCarriers']);
  const carrierMapperServiceMock = jasmine.createSpyObj<CarrierMapperService>('CarrierMapperService', ['mapCarrierNamesInSegments']);

  let sharedSessionServiceMock: SharedSessionService;
  let translateServiceMock: jasmine.SpyObj<TranslateService>;
  let markForCheckSpy: jasmine.Spy;
  let detectChangesSpy: jasmine.Spy;
  let rendererMock: jasmine.SpyObj<Renderer2>;

  // mock de matchMedia por TEST
  beforeEach(() => {
    let currentMatches = false;
    const listeners: Array<(ev: MediaQueryListEvent) => void> = [];

    const mql = {
      matches: currentMatches,
      media: '(max-width: 768px)',
      onchange: null,
      addEventListener: (type: string, listener: (ev: MediaQueryListEvent) => void) => {
        if (type === 'change' && typeof listener === 'function') {
          listeners.push(listener);
        }
      },
      removeEventListener: (type: string, listener: (ev: MediaQueryListEvent) => void) => {
        const idx = listeners.indexOf(listener);
        if (idx > -1) {
          listeners.splice(idx, 1);
        }
      },
      // compat API antigua
      addListener: (listener: (ev: MediaQueryListEvent) => void) => {
        listeners.push(listener);
      },
      removeListener: (listener: (ev: MediaQueryListEvent) => void) => {
        const idx = listeners.indexOf(listener);
        if (idx > -1) {
          listeners.splice(idx, 1);
        }
      },
      dispatchEvent: () => true,
    } as unknown as MediaQueryList;

    // en vez de spyOn (que da problemas si ya está espiado), asignamos directamente
    (globalThis as any).matchMedia = () => mql;

    mqlTrigger = (matches: boolean) => {
      currentMatches = matches;
      (mql as any).matches = matches;
      const ev = { matches } as MediaQueryListEvent;
      listeners.forEach((l) => l(ev));
      if (mql.onchange) {
        mql.onchange(ev);
      }
    };
  });

  beforeEach(fakeAsync(() => {
    loggerServiceMock.error.calls.reset();
    viewportSizeServiceMock.getComponentLayoutBreakpoint.calls.reset();
    builderServiceMock.getData.calls.reset();
    bookingMapperServiceMock.mapIfNeeded.calls.reset();
    storageServiceMock.getSessionStorage.calls.reset();
    journeyEnricherServiceMock.enrichJourneysWithStatus.calls.reset();
    carriersRepositoryServiceMock.getCarriers.calls.reset();
    carrierMapperServiceMock.mapCarrierNamesInSegments.calls.reset();

    // Configure default return values for carrier services
    carriersRepositoryServiceMock.getCarriers.and.returnValue(of([]));
    carrierMapperServiceMock.mapCarrierNamesInSegments.and.returnValue([]);

    sharedSessionSubject = new Subject<SessionData>();
    sharedSessionServiceMock = {
      session$: sharedSessionSubject,
    } as unknown as SharedSessionService;

    translateServiceMock = jasmine.createSpyObj('TranslateService', ['instant']);
    translateServiceMock.instant.and.callFake((k: string) => k);
    translateServiceMock.instant.calls.reset();

    rendererMock = jasmine.createSpyObj('Renderer2', ['addClass', 'removeClass']);

    viewportSizeServiceMock.getComponentLayoutBreakpoint.and.returnValue(768);

    TestBed.configureTestingModule({
      imports: [SummaryCartComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: LoggerService, useValue: loggerServiceMock },
        { provide: ViewportSizeService, useValue: viewportSizeServiceMock },
        { provide: TranslateService, useValue: translateServiceMock },
        { provide: SUMMARY_CART_BUILDER_SERVICE, useValue: builderServiceMock },
        // Stub CHECK_IN_SUMMARY_BUILDER used to build journeys for shared booking
        { provide: CHECK_IN_SUMMARY_BUILDER, useValue: { buildCheckInSummaryModel: jasmine.createSpy('buildCheckInSummaryModel').and.returnValue([{ id: 'JX' }]) } },
        { provide: BookingMapperService, useValue: bookingMapperServiceMock },
        { provide: SharedSessionService, useValue: sharedSessionServiceMock },
        { provide: SessionStore, useValue: sessionStoreMock },
        { provide: Renderer2, useValue: rendererMock },
        { provide: StorageService, useValue: storageServiceMock },
        { provide: JourneyEnricherService, useValue: journeyEnricherServiceMock },
        { provide: CarriersRepositoryService, useValue: carriersRepositoryServiceMock },
        { provide: CarrierMapperService, useValue: carrierMapperServiceMock },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).overrideTemplate(SummaryCartComponent, '');

    fixture = TestBed.createComponent(SummaryCartComponent);
    component = fixture.componentInstance;
    (component as any).renderer = rendererMock;

    const cdr = (component as any).changeDetector as ChangeDetectorRef;
    markForCheckSpy = spyOn(cdr, 'markForCheck').and.callThrough();
    detectChangesSpy = spyOn(cdr, 'detectChanges').and.callThrough();
  }));

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit should call internalInit and setOffCanvasConfig', fakeAsync(() => {
    const internalSpy = spyOn<any>(component, 'internalInit').and.callThrough();
    const setOffSpy = spyOn<any>(component, 'setOffCanvasConfig').and.callThrough();

    component.ngOnInit();
    tick();

    expect(internalSpy).toHaveBeenCalledTimes(1);
    expect(setOffSpy).toHaveBeenCalledTimes(2);
  }));

  it('setOffCanvasConfig should set title and markForCheck', () => {
    translateServiceMock.instant.and.returnValue('Translated title');

    (component as any).setOffCanvasConfig();

    const cfg = component.offCanvasConfig();
    expect(translateServiceMock.instant).toHaveBeenCalledWith('Basket.Book_Summary_Title');
    expect(cfg.offCanvasHeaderConfig?.title).toBe('Translated title');
    expect(cfg.panelClass).toBe('summary-cart-offcanvas');
    expect(markForCheckSpy).toHaveBeenCalled();
  });

  it('setIsResponsive should set initial state and respond to changes', fakeAsync(() => {
    // el componente pedirá el breakpoint
    viewportSizeServiceMock.getComponentLayoutBreakpoint.and.returnValue(640);

    // ciclo real: ngOnInit lo llama internamente
    component.ngOnInit();
    tick();

    // estado inicial NO responsive
    mqlTrigger(false);
    tick();
    expect(component.isResponsive()).toBeFalse();

    // ahora cambia el media query
    mqlTrigger(true);
    tick(); // no sabemos si hay timeout dentro, pero primero intentamos sin más

    // si tu implementación tuviera un pequeño delay, cambia este tick() por tick(200)
    expect(component.isResponsive()).toBeTrue();
    expect(detectChangesSpy).toHaveBeenCalled();
  }));

  it('onClickToggle should toggle isOpenSummary', () => {
    component.isOpenSummary.set(false);
    component.onClickToggle();
    expect(component.isOpenSummary()).toBeTrue();
    component.onClickToggle();
    expect(component.isOpenSummary()).toBeFalse();
  });

  it('onDropdownOpenChange should set isOpenSummary', () => {
    component.isResponsive.set(false); // desktop mode
    
    rendererMock.addClass.calls.reset();
    rendererMock.removeClass.calls.reset();
    
    component.onDropdownOpenChange(true);
    expect(component.isOpenSummary()).toBeTrue();
    expect(rendererMock.addClass).toHaveBeenCalledWith(document.body, 'summary-opened');
    
    rendererMock.addClass.calls.reset();
    rendererMock.removeClass.calls.reset();
    
    component.onDropdownOpenChange(false);
    expect(component.isOpenSummary()).toBeFalse();
    expect(rendererMock.removeClass).toHaveBeenCalledWith(document.body, 'summary-opened');
  });

  it('onOffCanvasClosed should set isOpenSummary false', () => {
    component.isResponsive.set(true); // mobile mode
    component.isOpenSummary.set(true);
    
    rendererMock.addClass.calls.reset();
    rendererMock.removeClass.calls.reset();
    
    component.onOffCanvasClosed();
    expect(component.isOpenSummary()).toBeFalse();
    expect(rendererMock.removeClass).toHaveBeenCalledWith(document.body, 'summary-opened');
  });

  it('onCloseButtonClicked should close dropdown if present', fakeAsync(() => {
    component.isResponsive.set(false); // desktop mode
    const closeSpy = jasmine.createSpy('close');
    (component as any).summaryCartDropdown = { close: closeSpy } as any;
    component.isOpenSummary.set(true);

    rendererMock.addClass.calls.reset();
    rendererMock.removeClass.calls.reset();

    component.onCloseButtonClicked();
    tick(); // Wait for setTimeout in returnFocusToButton

    expect(closeSpy).toHaveBeenCalled();
    expect(component.isOpenSummary()).toBeFalse();
    expect(rendererMock.removeClass).toHaveBeenCalledWith(document.body, 'summary-opened');
  }));

  it('returnFocusToButton should focus button element when available', fakeAsync(() => {
    const mockButton = document.createElement('button');
    spyOn(mockButton, 'focus');
    
    const mockElement = {
      nativeElement: {
        querySelector: jasmine.createSpy('querySelector').and.returnValue(mockButton)
      }
    };
    
    (component as any).toggleButton = mockElement;
    
    (component as any).returnFocusToButton();
    tick();
    
    expect(mockElement.nativeElement.querySelector).toHaveBeenCalledWith('button');
    expect(mockButton.focus).toHaveBeenCalled();
  }));

  it('returnFocusToButton should not throw when button element not found', fakeAsync(() => {
    const mockElement = {
      nativeElement: {
        querySelector: jasmine.createSpy('querySelector').and.returnValue(null)
      }
    };
    
    (component as any).toggleButton = mockElement;
    
    expect(() => {
      (component as any).returnFocusToButton();
      tick();
    }).not.toThrow();
  }));

  it('canOpenSummary should be true only if booking has journeys', () => {
    component.config = {} as any;
    expect(component.canOpenSummary()).toBeFalse();

    component.config = {
      details: { summaryTypologyConfig: { booking: { journeys: [] } } },
    } as any;
    expect(component.canOpenSummary()).toBeFalse();

    component.config = {
      details: { summaryTypologyConfig: { booking: { journeys: [{ id: 'J1' }] } } },
    } as any;
    expect(component.canOpenSummary()).toBeTrue();
  });

  it('should map booking, build config, set button config and mark loaded when session has journeys', fakeAsync(() => {
    translateServiceMock.instant.and.returnValue('Title');

    const builderCfg: SummaryCartConfig = {
      details: {
        summaryTypologyConfig: {
          booking: { journeys: [{ id: 'B1' }] } as any,
        },
      },
      toggleButton: {
        ariaAttributes: {},
      },
    } as any;
    builderServiceMock.getData.and.returnValue(builderCfg);

    const sessionWithJourneys: SessionData = {
      session: {
        booking: {
          journeys: [{ id: 'J1' }],
          pricing: { balanceDue: 99.99, currency: 'EUR' },
        } as unknown as Booking,
      },
    } as any;

    bookingMapperServiceMock.mapIfNeeded.and.callFake((b: ApiBooking) => b as unknown as Booking);

    component.ngOnInit();
    tick();

    sharedSessionSubject.next(sessionWithJourneys);
    tick();

    expect(bookingMapperServiceMock.mapIfNeeded).toHaveBeenCalledWith(
      sessionWithJourneys.session.booking as unknown as ApiBooking
    );
    expect(builderServiceMock.getData).toHaveBeenCalled();

    expect(component.config).toBe(builderCfg);
    expect(component.detailConfigForDesktop).toBeTruthy();
    expect(component.detailConfigForDesktop?.showCloseButton).toBeTrue();

    const btn: SummaryCartButtonConfig = component.buttonConfig();
    expect(btn.amount).toBe(99.99);
    expect(btn.currency).toBe('EUR');
    expect(btn.toggleButtonConfig?.ariaAttributes?.ariaControls).toBe(component.dropdownId);
    expect(btn.toggleButtonConfig?.ariaAttributes?.ariaDisabled).toBeFalse();

    expect(component.isLoaded()).toBeTrue();
    expect(detectChangesSpy).toHaveBeenCalled();
  }));

  it('should build config without journey enrichment when storage data is missing', fakeAsync(() => {
    translateServiceMock.instant.and.returnValue('Title');
    
    const builderCfg: SummaryCartConfig = {
      details: {
        summaryTypologyConfig: {
          booking: { journeys: [{ id: 'B1' }] } as any,
        },
      },
      toggleButton: {
        ariaAttributes: {},
      },
    } as any;
    builderServiceMock.getData.and.returnValue(builderCfg);

    const sessionWithJourneys: SessionData = {
      session: {
        booking: {
          journeys: [{ id: 'J1' }],
          pricing: { balanceDue: 99.99, currency: 'EUR' },
        } as unknown as Booking,
      },
    } as any;

    bookingMapperServiceMock.mapIfNeeded.and.callFake((b: ApiBooking) => b as unknown as Booking);
    storageServiceMock.getSessionStorage.and.returnValue(null); // No storage data

    component.ngOnInit();
    tick();

    sharedSessionSubject.next(sessionWithJourneys);
    tick();

    expect(storageServiceMock.getSessionStorage).toHaveBeenCalled();
    expect(journeyEnricherServiceMock.enrichJourneysWithStatus).not.toHaveBeenCalled();
    expect(component.isLoaded()).toBeTrue();
  }));

  it('should handle session with storage data and enrich journeys', fakeAsync(() => {
    translateServiceMock.instant.and.returnValue('Title');
    
    const builderCfg: SummaryCartConfig = {
      details: {
        summaryTypologyConfig: {
          booking: { journeys: [{ id: 'B1' }] } as any,
        },
      },
      toggleButton: {
        ariaAttributes: {},
      },
    } as any;
    builderServiceMock.getData.and.returnValue(builderCfg);

    const sessionWithJourneys: SessionData = {
      session: {
        booking: {
          journeys: [{ id: 'J1' }],
          pricing: { balanceDue: 99.99, currency: 'EUR' },
        } as unknown as Booking,
      },
    } as any;

    const mockEnrichedJourneys = [{ id: 'J1', status: 'enriched' }] as any;
    bookingMapperServiceMock.mapIfNeeded.and.callFake((b: ApiBooking) => b as unknown as Booking);
    storageServiceMock.getSessionStorage.and.returnValues(
      { 'segment-status': 'data' }, // segmentStatus
      { 'pax-status': 'data' }     // passengerStatus
    );
    journeyEnricherServiceMock.enrichJourneysWithStatus.and.returnValue(mockEnrichedJourneys);

    component.ngOnInit();
    tick();

    sharedSessionSubject.next(sessionWithJourneys);
    tick();

    expect(storageServiceMock.getSessionStorage).toHaveBeenCalledWith(EnumStorageKey.SegmentsStatusByJourney);
    expect(storageServiceMock.getSessionStorage).toHaveBeenCalledWith(EnumStorageKey.PaxSegmentCheckInStatus);
    expect(journeyEnricherServiceMock.enrichJourneysWithStatus).toHaveBeenCalled();
    expect(component.isLoaded()).toBeTrue();
  }));

  it('should NOT build config nor set loaded when session has NO journeys', fakeAsync(() => {
    const sessionNoJourneys: SessionData = {
      session: {
        booking: {
          journeys: [],
          pricing: { balanceDue: 0, currency: 'EUR' },
        } as unknown as Booking,
      },
    } as any;

    component.ngOnInit();
    tick();

    sharedSessionSubject.next(sessionNoJourneys);
    tick();

    expect(builderServiceMock.getData).not.toHaveBeenCalled();
    expect(component.isLoaded()).toBeFalse();
  }));

  it('should log error when session$ emits error', fakeAsync(() => {
    const err = new Error('network');

    component.ngOnInit();
    tick();

    sharedSessionSubject.error(err);
    tick();

    expect(loggerServiceMock.error).toHaveBeenCalledWith(
      'SummaryCartComponent',
      'Error getting session',
      err
    );
  }));

  it('setButtonConfig should set ariaDisabled true when no journeys', () => {
    component.config = {
      toggleButton: {},
      details: {
        summaryTypologyConfig: { booking: { journeys: [] } as any },
      },
    } as any;

    const sessionWithoutJourneys: SessionData = {
      session: {
        booking: {
          journeys: [],
          pricing: { balanceDue: 0, currency: 'EUR' },
        } as unknown as Booking,
      },
    } as any;

    (component as any).setButtonConfig(sessionWithoutJourneys);

    const btn = component.buttonConfig();
    expect(btn.toggleButtonConfig.ariaAttributes?.ariaDisabled).toBeTrue();
  });

  it('should build correct aria expanded state when summary is open', fakeAsync(() => {
    translateServiceMock.instant.and.returnValue('Title');
    
    const builderCfg: SummaryCartConfig = {
      details: {
        summaryTypologyConfig: {
          booking: { journeys: [{ id: 'B1' }] } as any,
        },
      },
      toggleButton: {
        ariaAttributes: {},
      },
    } as any;
    builderServiceMock.getData.and.returnValue(builderCfg);

    const sessionWithJourneys: SessionData = {
      session: {
        booking: {
          journeys: [{ id: 'J1' }],
          pricing: { balanceDue: 99.99, currency: 'EUR' },
        } as unknown as Booking,
      },
    } as any;

    bookingMapperServiceMock.mapIfNeeded.and.callFake((b: ApiBooking) => b as unknown as Booking);
    storageServiceMock.getSessionStorage.and.returnValue(null);

    component.ngOnInit();
    component.isOpenSummary.set(true); // Set summary as open
    tick();

    sharedSessionSubject.next(sessionWithJourneys);
    tick();

    const btn = component.buttonConfig();
    expect(btn.toggleButtonConfig.ariaAttributes?.ariaExpanded).toBeTrue();
    expect(btn.toggleButtonConfig.ariaAttributes?.ariaControls).toBe(component.dropdownId);
  }));

  it('should handle XSS attack in translation values safely', () => {
    const maliciousTranslation = '<img src=x onerror=alert(1)>';
    translateServiceMock.instant.and.returnValue(maliciousTranslation);
    
    (component as any).setOffCanvasConfig();
    
    const cfg = component.offCanvasConfig();
    expect(cfg.offCanvasHeaderConfig?.title).toBe(maliciousTranslation);
    expect(typeof cfg.offCanvasHeaderConfig?.title).toBe('string');
  });

  describe('setSummaryOpen', () => {
    it('setSummaryOpen should add/remove body class in desktop mode', () => {
      component.isResponsive.set(false); // desktop mode
      
      rendererMock.addClass.calls.reset();
      rendererMock.removeClass.calls.reset();
      
      (component as any).setSummaryOpen(true);
      expect(rendererMock.addClass).toHaveBeenCalledWith(document.body, 'summary-opened');
      expect(component.isOpenSummary()).toBeTrue();
  
      rendererMock.addClass.calls.reset();
      rendererMock.removeClass.calls.reset();
  
      (component as any).setSummaryOpen(false);
      expect(rendererMock.removeClass).toHaveBeenCalledWith(document.body, 'summary-opened');
      expect(component.isOpenSummary()).toBeFalse();
    });
  
    it('setSummaryOpen should not add body class in mobile mode', () => {
      component.isResponsive.set(true); // mobile mode
      
      rendererMock.addClass.calls.reset();
      rendererMock.removeClass.calls.reset();
      
      (component as any).setSummaryOpen(true);
      expect(rendererMock.addClass).not.toHaveBeenCalled();
      expect(rendererMock.removeClass).toHaveBeenCalledWith(document.body, 'summary-opened');
      expect(component.isOpenSummary()).toBeTrue();
  
      rendererMock.addClass.calls.reset();
      rendererMock.removeClass.calls.reset();
  
      (component as any).setSummaryOpen(false);
      expect(rendererMock.removeClass).toHaveBeenCalledWith(document.body, 'summary-opened');
      expect(component.isOpenSummary()).toBeFalse();
    });
  });

  describe('defensive and security testing', () => {
    it('should handle null session data gracefully', fakeAsync(() => {
      component.ngOnInit();
      tick();
      
      sharedSessionSubject.next(null as any);
      tick();
      
      expect(component.isLoaded()).toBeFalse();
      expect(builderServiceMock.getData).not.toHaveBeenCalled();
    }));
    
    it('should handle session with null booking gracefully', fakeAsync(() => {
      component.ngOnInit();
      tick();
      
      const sessionWithNullBooking: SessionData = {
        session: {
          booking: null as any,
        },
      } as any;
      
      sharedSessionSubject.next(sessionWithNullBooking);
      tick();
      
      expect(component.isLoaded()).toBeFalse();
      expect(builderServiceMock.getData).not.toHaveBeenCalled();
    }));
    
    it('should handle undefined journeys gracefully', fakeAsync(() => {
      component.ngOnInit();
      tick();
      
      const sessionWithUndefinedJourneys: SessionData = {
        session: {
          booking: {
            journeys: undefined as any,
            pricing: { balanceDue: 99.99, currency: 'EUR' },
          } as unknown as Booking,
        },
      } as any;
      
      sharedSessionSubject.next(sessionWithUndefinedJourneys);
      tick();
      
      expect(component.isLoaded()).toBeFalse();
      expect(builderServiceMock.getData).not.toHaveBeenCalled();
    }));
  });
});
