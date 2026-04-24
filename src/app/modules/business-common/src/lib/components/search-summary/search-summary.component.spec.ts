import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { SearchSummaryComponent } from './search-summary.component';
import { SearchSummaryVM } from './models/search-summary-vm.model';
import { DescriptionListLayoutType, DescriptionListOptionType } from '@dcx/ui/design-system';
import { PaxTypeCode, SessionStore, ViewportSizeService } from '@dcx/ui/libs';
import { i18nTestingImportsWithMemoryLoader } from '@dcx/ui/storybook-i18n';
import { ModuleTranslationService } from '@dcx/module/translation';
import { TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';

describe('SearchSummaryComponent', () => {
  let component: SearchSummaryComponent;
  let fixture: ComponentFixture<SearchSummaryComponent>;
  let viewportSizeServiceMock: jasmine.SpyObj<ViewportSizeService>;
  let translate: TranslateService;
  let sessionStoreMock: jasmine.SpyObj<SessionStore>;

  const mockVM: SearchSummaryVM = {
    route: { origin: 'MAD', destination: 'BCN' },
    dates: { departureDate: new Date(2025, 8, 19), returnDate: new Date(2025, 8, 21) },
    passengers: [
      { code: PaxTypeCode.ADT, quantity: 2 },
      { code: PaxTypeCode.CHD, quantity: 1 },
    ],
  };

  let mqAddSpy: jasmine.Spy;
  let mqRemoveSpy: jasmine.Spy;
  let lastMqHandler: ((e: MediaQueryListEvent) => void) | null = null;
  let matchMediaSpy: jasmine.Spy<(query: string) => MediaQueryList>;

  beforeEach(fakeAsync(() => {
    viewportSizeServiceMock = jasmine.createSpyObj('ViewportSizeService', ['getComponentLayoutBreakpoint']);
    viewportSizeServiceMock.getComponentLayoutBreakpoint.and.returnValue(992);

    sessionStoreMock = jasmine.createSpyObj('SessionStore', ['getSession']);
    sessionStoreMock.getSession.and.returnValue({
      session: {},
      userAgentResponse: undefined,
    } as any);

    mqAddSpy = jasmine.createSpy('addEventListener').and.callFake((event: string, cb: any) => {
      if (event === 'change') {
        lastMqHandler = cb;
      }
    });
    mqRemoveSpy = jasmine.createSpy('removeEventListener');
    lastMqHandler = null;

    const globalAny = globalThis as any;
    const existingMatchMedia = globalAny.matchMedia as jasmine.Spy | undefined;
    if (existingMatchMedia?.and && existingMatchMedia?.calls) {
      matchMediaSpy = existingMatchMedia;
      matchMediaSpy.calls.reset();
    } else {
      matchMediaSpy = spyOn(globalAny, 'matchMedia');
    }

    matchMediaSpy.and.returnValue({
      matches: false,
      addEventListener: mqAddSpy,
      removeEventListener: mqRemoveSpy,
    } as any);

    TestBed.configureTestingModule({
      imports: [
        SearchSummaryComponent,
        HttpClientTestingModule,
        i18nTestingImportsWithMemoryLoader({}),
      ],
      providers: [
        { provide: ModuleTranslationService, useValue: { loadModuleTranslations: () => of(true) } as any },
        { provide: ViewportSizeService, useValue: viewportSizeServiceMock },
        { provide: SessionStore, useValue: sessionStoreMock },
      ],
    });

    translate = TestBed.inject(TranslateService);
    translate.setTranslation(
      'en',
      {
        'Common.Passengers': 'Passengers',
        'Common.Passenger': 'Passenger',
        'PassengerTypes.Plural_ADT': 'Adults',
        'PassengerTypes.ADT': 'Adult',
        'PassengerTypes.Plural_CHD': 'Children',
        'PassengerTypes.CHD': 'Child',
        'Common.Departure_Date': 'Departure',
        'Common.Return_Date': 'Return',
      },
      true
    );
    translate.use('en');

    fixture = TestBed.createComponent(SearchSummaryComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('data', mockVM);
  }));

  describe('creation', () => {
    it('should create', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      expect(component).toBeTruthy();
    }));
  });

  describe('ngOnInit', () => {
    it('should initialize signals and build info data', fakeAsync(() => {
      const markSpy = spyOn((component as any).cdr, 'markForCheck').and.callThrough();
      const setInfoSpy = spyOn(component as any, 'setInformationData').and.callThrough();

      fixture.detectChanges();
      tick();

      expect(component.origin()).toBe('MAD');
      expect(component.destination()).toBe('BCN');
      expect(component.passengerTypesConfig()).toEqual([
        jasmine.objectContaining({ code: jasmine.anything(), quantity: 2 }),
        jasmine.objectContaining({ code: jasmine.anything(), quantity: 1 }),
      ]);
      expect(component.showPassengerCountOnly()).toBeFalse();
      expect(setInfoSpy).toHaveBeenCalled();
      expect(markSpy).toHaveBeenCalled();
    }));
  });

  describe('origin & destination', () => {
    it('should expose origin/destination and combined tuple after init', fakeAsync(() => {
      fixture.detectChanges();
      tick();

      expect(component.origin()).toBe('MAD');
      expect(component.destination()).toBe('BCN');
      expect(component.originAndDestination()).toEqual(['MAD', 'BCN']);

      (component as any).setOriginAndDestination();
      expect(component.originAndDestination()).toEqual(['MAD', 'BCN']);
    }));
  });

  describe('passengerTypesConfig', () => {
    it('should be set from input data after init', fakeAsync(() => {
      fixture.detectChanges();
      tick();

      expect(component.passengerTypesConfig()).toEqual([
        jasmine.objectContaining({ code: jasmine.anything(), quantity: 2 }),
        jasmine.objectContaining({ code: jasmine.anything(), quantity: 1 }),
      ]);

      (component as any).setPassengerTypesConfig();
      expect(component.passengerTypesConfig().length).toBe(2);
    }));
  });

  describe('responsive behavior', () => {
    it('should toggle showPassengerCountOnly on media query change', fakeAsync(() => {
      fixture.detectChanges();
      tick();

      expect(viewportSizeServiceMock.getComponentLayoutBreakpoint)
        .toHaveBeenCalledWith('--header-flow-summary-cart-breakpoint');
      expect(globalThis.matchMedia).toHaveBeenCalledWith('(max-width: 992px)');
      expect(component.showPassengerCountOnly()).toBeFalse();

      const markSpy = spyOn((component as any).cdr, 'markForCheck').and.callThrough();

      lastMqHandler && lastMqHandler({ matches: true } as any);
      fixture.detectChanges();
      expect(component.showPassengerCountOnly()).toBeTrue();
      expect(markSpy).toHaveBeenCalled();

      lastMqHandler && lastMqHandler({ matches: false } as any);
      fixture.detectChanges();
      expect(component.showPassengerCountOnly()).toBeFalse();
    }));
  });

  describe('buildPassengerStrings', () => {
    it('should build passenger strings for mobile and desktop', fakeAsync(() => {
      fixture.detectChanges();
      tick();

      const result = (component as any).buildPassengerStrings();
      expect(result.passengersMobile).toBe('3 Passengers');
      expect(result.passengersDesktop).toBe('2 Adults, 1 Child');
    }));
  });

  describe('information data (description list)', () => {
    it('should set informationData with correct items after init', fakeAsync(() => {
      fixture.detectChanges();
      tick();

      const info = (component as any).informationData();
      expect(info).toBeTruthy();
      expect(info.options.length).toBe(3);

      expect(info.options[0].term).toBe('Departure:');
      expect(info.options[0].type).toBe(DescriptionListOptionType.DATE);

      expect(info.options[1].term).toBe('Return:');
      expect(info.options[1].type).toBe(DescriptionListOptionType.DATE);

      expect(info.options[2].term).toBe('Passengers:');
      expect(info.options[2].type).toBe(DescriptionListOptionType.TEXT);
      expect((info.options[2].description as any).text).toBe('2 Adults, 1 Child');
      expect(info.ariaAttributes).toBeUndefined();
      expect(info.layout).toBe(DescriptionListLayoutType.INLINE);
    }));

    it('should update passenger string to mobile when showPassengerCountOnly is true', fakeAsync(() => {
      fixture.detectChanges();
      tick();

      component.showPassengerCountOnly.set(true);
      (component as any).setInformationData();

      const info = (component as any).informationData();
      expect((info.options[2].description as any).text).toBe('3 Passengers');
    }));
  });

  describe('toDisplayDate', () => {
    it('should convert date to display date at noon', () => {
      const date = new Date(2025, 8, 19, 5, 30);
      const result = (component as any).toDisplayDate(date);
      expect(result.getHours()).toBe(12);
      expect(result.getFullYear()).toBe(2025);
      expect(result.getMonth()).toBe(8);
      expect(result.getDate()).toBe(19);
    });
  });
});
