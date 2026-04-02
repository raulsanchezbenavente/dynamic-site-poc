import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SummaryCartDetailComponent } from './summary-cart-detail.component';
import { TranslateService } from '@ngx-translate/core';
import { CultureServiceEx, JourneyVM, ButtonStyles } from '@dcx/ui/libs';
import { TagConfig } from '@dcx/ui/design-system';

// Minimal local typing to keep the spec self-contained
type SummaryCartItineraryConfig = {
  journey: any;
  fareTagConfig?: TagConfig;
};
type SummaryCartDetailConfig = {
  journeys: {
    outbound?: SummaryCartItineraryConfig;
    inbound?: SummaryCartItineraryConfig;
  };
  summaryTypologyConfig: {
    booking: {
      journeys: JourneyVM[];
      pricing?: { totalAmount: number; currency: string };
    };
  };
};

describe('SummaryCartDetailComponent', () => {
  let fixture: ComponentFixture<SummaryCartDetailComponent>;
  let component: SummaryCartDetailComponent;

  // TranslateService mock
  const translateServiceMock = {
    instant: jasmine.createSpy('instant').and.callFake((k: string) => k),
  } as unknown as jasmine.SpyObj<TranslateService>;

  // CultureServiceEx kept for provider pattern consistency (aunque no lo use el SUT)
  const cultureServiceExMock = {
    getUserCulture: jasmine.createSpy('getUserCulture'),
  } as unknown as jasmine.SpyObj<CultureServiceEx>;

  // Helpers
  const j1 = { id: 'J-OUT', fare: { code: 'F1' } } as unknown as JourneyVM;
  const j2 = { id: 'J-IN',  fare: { code: 'F2' } } as unknown as JourneyVM;

  const makeConfig = (withPricing = true): SummaryCartDetailConfig => ({
    journeys: {
      outbound: { journey: { id: 'OUT-J', other: true } },
      inbound:  { journey: { id: 'IN-J',  other: true } },
    },
    summaryTypologyConfig: {
      booking: {
        journeys: [j1, j2],
        ...(withPricing ? { pricing: { totalAmount: 123.45, currency: 'EUR' } } : {}),
      },
    },
  });

  beforeEach(() => {
    // Reset spies
    (translateServiceMock.instant as jasmine.Spy).calls.reset();
    cultureServiceExMock.getUserCulture.calls.reset();

    TestBed.configureTestingModule({
      imports: [SummaryCartDetailComponent],
      providers: [
        { provide: TranslateService, useValue: translateServiceMock },
        { provide: CultureServiceEx, useValue: cultureServiceExMock },
      ]
    });
    TestBed.overrideTemplate(SummaryCartDetailComponent, '').compileComponents();

    fixture = TestBed.createComponent(SummaryCartDetailComponent);
    component = fixture.componentInstance;
  });

  // ------------------
  // Creation
  // ------------------

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // ------------------
  // input.required
  // ------------------

  it('should throw if required input [config] is missing', () => {
    // In Angular 19, required inputs throw when accessed, not during detectChanges
    expect(() => component.config()).toThrow();
  });

  // ------------------
  // ngOnInit: translation-driven setters
  // ------------------

  it('ngOnInit should set translation-driven configs (labels)', () => {
    fixture.componentRef.setInput('config', makeConfig(true));
    fixture.detectChanges(); // dispara ngOnInit

    expect(component.closeButtonConfig.label).toBe('Common.Close');
    expect(component.closeButtonConfig.layout?.style).toBe(ButtonStyles.LINK);
    expect(component.summaryTotalConfig.label).toBe('Common.Total');

    // No esperamos markForCheck aquí porque el SUT no lo llama en ngOnInit
  });

  // ------------------
  // summaryTotalData (computed)
  // ------------------

  it('should derive summaryTotalData from pricing (computed)', () => {
    fixture.componentRef.setInput('config', makeConfig(true));
    fixture.detectChanges();

    const total = component.summaryTotalData();

    expect(total.amount).toBe(123.45);
    expect(total.currency).toBe('EUR');
  });

  it('should return default summaryTotalData when pricing is missing', () => {
    fixture.componentRef.setInput('config', makeConfig(false));
    fixture.detectChanges();

    const total = component.summaryTotalData();

    expect(total.amount).toBe(0);
    expect(total.currency).toBe('');
  });

  it('should recompute summaryTotalData when pricing changes', () => {
    fixture.componentRef.setInput('config', makeConfig(true));
    fixture.detectChanges();

    expect(component.summaryTotalData().amount).toBe(123.45);

    const updateConfig = makeConfig(true);
    updateConfig.summaryTypologyConfig.booking.pricing = {
      totalAmount: 200,
      currency: 'EUR',
    };

    fixture.componentRef.setInput('config', updateConfig);
    fixture.detectChanges();

    expect(component.summaryTotalData().amount).toBe(200);
    expect(component.summaryTotalData().currency).toBe('EUR');
  });

  // ------------------
  // journeys computed (use component method spy)
  // ------------------

  it('journeys computed should map outbound/inbound and use buildFareTagConfig for booking journeys', () => {
    fixture.componentRef.setInput('config', makeConfig(true));

    const fakeTagOutbound: TagConfig = { text: 'flex',  cssClass: 'fare-flex' };
    const fakeTagInbound:  TagConfig = { text: 'light', cssClass: 'fare-light' };

    const buildSpy = spyOn<any>(component, 'buildFareTagConfig').and.callFake((journey: JourneyVM) => {
      if ((journey as any).id === 'J-OUT') return fakeTagOutbound;
      if ((journey as any).id === 'J-IN')  return fakeTagInbound;
      return { text: 'unknown', cssClass: 'fare-uk' };
    });

    const j = component.journeys();

    // Called for booking journeys [0] and [1]
    expect(buildSpy).toHaveBeenCalledTimes(2);
    expect(buildSpy.calls.argsFor(0)[0]).toBe(j1);
    expect(buildSpy.calls.argsFor(1)[0]).toBe(j2);

    // TagConfig reflected in computed output
    expect(j.outbound?.fareTagConfig).toEqual(fakeTagOutbound);
    expect(j.inbound?.fareTagConfig).toEqual(fakeTagInbound);
  });

  // ------------------
  // Output: closeButtonClicked
  // ------------------

  it('onCloseButtonClicked should emit closeButtonClicked', () => {
    fixture.componentRef.setInput('config', makeConfig(true));
    const emitSpy = spyOn(component.closeButtonClicked, 'emit');

    component.onCloseButtonClicked();

    expect(emitSpy).toHaveBeenCalled();
  });
});
