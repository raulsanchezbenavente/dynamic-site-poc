import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChangeDetectorRef } from '@angular/core';

import { SummaryCartItineraryComponent } from './summary-cart-itinerary.component';

import { CultureServiceEx, JourneyType } from '@dcx/ui/libs';
import { TranslateService } from '@ngx-translate/core';
import { CarriersDisplayMode } from '../../../schedules';
import { CarrierMapperService } from '../../../../services/carrier-mapper/carrier-mapper.service';

// Config types used in the component
type SummaryCartItineraryConfig = {
  journey: {
    journeyType: JourneyType;
    schedule: {
      std: string | Date; // departure (outbound)
      sta: string | Date; // arrival (inbound/return)
    };
    segments?: Array<{ transport: { carrier: { name: string } } }>;
  };
};

describe('SummaryCartItineraryComponent', () => {
  let fixture: ComponentFixture<SummaryCartItineraryComponent>;
  let component: SummaryCartItineraryComponent;

  const translateServiceMock = {
    instant: jasmine.createSpy('instant').and.callFake((k: string) => k),
  } as unknown as jasmine.SpyObj<TranslateService>;

  const cultureServiceExMock = {
    getUserCulture: jasmine.createSpy('getUserCulture'),
  } as unknown as jasmine.SpyObj<CultureServiceEx>;

  const carrierMapperServiceMock = {
    getUniqueOperatingCarriers: jasmine.createSpy('getUniqueOperatingCarriers').and.callFake((segments: any[]) => {
      // Simulate deduplication by operatingAirlineCode (or code or name as fallback)
      const uniqueMap = new Map<string, string>();
      for (const seg of segments) {
        const code = seg.transport?.carrier?.operatingAirlineCode || seg.transport?.carrier?.code || seg.transport?.carrier?.name;
        const name = seg.transport?.carrier?.name;
        if (!uniqueMap.has(code)) {
          uniqueMap.set(code, name);
        }
      }
      return Array.from(uniqueMap.values());
    }),
  } as unknown as jasmine.SpyObj<CarrierMapperService>;

  const makeConfig = (
    journeyType: JourneyType,
    std: Date,
    sta: Date,
    segments?: Array<{ transport: { carrier: { name: string } } }>
  ): SummaryCartItineraryConfig => ({
    journey: {
      journeyType,
      schedule: { std, sta },
      ...(segments ? { segments } : {}),
    },
  });

  beforeEach(() => {
    // Reset spies
    (translateServiceMock.instant as jasmine.Spy).calls.reset();
    cultureServiceExMock.getUserCulture.calls.reset();
    carrierMapperServiceMock.getUniqueOperatingCarriers.calls.reset();

    TestBed.configureTestingModule({
      imports: [SummaryCartItineraryComponent],
      providers: [
        { provide: TranslateService, useValue: translateServiceMock },
        { provide: CultureServiceEx, useValue: cultureServiceExMock },
        { provide: CarrierMapperService, useValue: carrierMapperServiceMock },
      ],
    })
      .overrideTemplate(SummaryCartItineraryComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(SummaryCartItineraryComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });


  it('should throw if required input [config] is missing', () => {
    // No establecemos config -> lectura del input.required debe lanzar
    expect(() => {
      fixture.detectChanges();
      (component as any).config(); // fuerza la lectura
    }).toThrow();
  });

  it('ngOnInit should set isOutbound from journey and compute labels/format', () => {
    // Arrange
    const std = new Date(2025, 8, 1, 9, 0, 0);
    const sta = new Date(2025, 8, 10, 20, 0, 0);
    fixture.componentRef.setInput('config', makeConfig(JourneyType.OUTBOUND, std, sta));
    cultureServiceExMock.getUserCulture.and.returnValue({ longDateFormat: 'dd/MM/yyyy' });

    const cdr = (component as any).cdr as ChangeDetectorRef;
    const markForCheckSpy = spyOn(cdr, 'markForCheck').and.callThrough();

    // Act
    component.ngOnInit();

    // Assert init path
    expect(component.isOutbound).toBeTrue();
    expect(component.translatedLabel).toBe('Schedule.DepartureLabel');
    expect((component as any).shortDateFormat).toBe('dd/MM/yyyy');

    expect(markForCheckSpy).toHaveBeenCalled();
    expect(markForCheckSpy.calls.count()).toBeGreaterThanOrEqual(2);
  });

  // ------------------
  // setTranslatedLabel: OUTBOUND / INBOUND / RETURN / default
  // ------------------

  it('setTranslatedLabel should set correct label for OUTBOUND and mark for check', () => {
    fixture.componentRef.setInput(
      'config',
      makeConfig(JourneyType.OUTBOUND, new Date(2025, 8, 1), new Date(2025, 8, 2))
    );
    const cdr = (component as any).cdr as ChangeDetectorRef;
    const markForCheckSpy = spyOn(cdr, 'markForCheck');

    (component as any).setTranslatedLabel();

    expect(component.translatedLabel).toBe('Schedule.DepartureLabel');
    expect(translateServiceMock.instant).toHaveBeenCalledWith('Schedule.DepartureLabel');
    expect(markForCheckSpy).toHaveBeenCalled();
  });

  it('setTranslatedLabel should set correct label for INBOUND/RETURN and mark for check', () => {
    fixture.componentRef.setInput(
      'config',
      makeConfig(JourneyType.INBOUND, new Date(2025, 8, 1), new Date(2025, 8, 2))
    );
    const cdr = (component as any).cdr as ChangeDetectorRef;
    const markForCheckSpy = spyOn(cdr, 'markForCheck');

    (component as any).setTranslatedLabel();
    expect(component.translatedLabel).toBe('Schedule.ReturnLabel');
    expect(translateServiceMock.instant).toHaveBeenCalledWith('Schedule.ReturnLabel');
    expect(markForCheckSpy).toHaveBeenCalled();

    (translateServiceMock.instant as jasmine.Spy).calls.reset();
    fixture.componentRef.setInput(
      'config',
      makeConfig(JourneyType.RETURN, new Date(2025, 8, 1), new Date(2025, 8, 2))
    );
    (component as any).setTranslatedLabel();
    expect(component.translatedLabel).toBe('Schedule.ReturnLabel');
    expect(translateServiceMock.instant).toHaveBeenCalledWith('Schedule.ReturnLabel');
  });

  it('setTranslatedLabel should set empty string for unknown journey type', () => {
    const invalidJourney = 999 as unknown as JourneyType;
    fixture.componentRef.setInput(
      'config',
      makeConfig(invalidJourney, new Date(2025, 8, 1), new Date(2025, 8, 2))
    );
    const cdr = (component as any).cdr as ChangeDetectorRef;
    const markForCheckSpy = spyOn(cdr, 'markForCheck');

    (component as any).setTranslatedLabel();

    expect(component.translatedLabel).toBe('');
    expect(markForCheckSpy).toHaveBeenCalled();
  });

  // ------------------
  // setDateFormat
  // ------------------

  it('setDateFormat should use cultureServiceEx longDateFormat or default', () => {
    fixture.componentRef.setInput(
      'config',
      makeConfig(JourneyType.OUTBOUND, new Date(2025, 8, 1), new Date(2025, 8, 2))
    );
    const cdr = (component as any).cdr as ChangeDetectorRef;
    const markForCheckSpy = spyOn(cdr, 'markForCheck');

    cultureServiceExMock.getUserCulture.and.returnValue({ longDateFormat: 'yyyy-MM-dd' });

    (component as any).setDateFormat();

    expect((component as any).shortDateFormat).toBe('yyyy-MM-dd');
    expect(markForCheckSpy).toHaveBeenCalled();

    cultureServiceExMock.getUserCulture.and.returnValue(undefined as any);
    (component as any).setDateFormat();
    expect((component as any).shortDateFormat).toBe('EEE d MMM y');
  });

  it('dateConfig should return DEFAULT layout and date normalized to 12:00 local (OUTBOUND uses std, INBOUND uses sta)', () => {
    const std = new Date(2025, 8, 5, 9, 30, 0);
    const sta = new Date(2025, 8, 12, 21, 45, 0);
    fixture.componentRef.setInput('config', makeConfig(JourneyType.OUTBOUND, std, sta));

    // OUTBOUND -> use std
    let dc = component.dateConfig;
    const dcDate = dc.date as Date;
    expect(dcDate.getFullYear()).toBe(2025);
    expect(dcDate.getMonth()).toBe(8);
    expect(dcDate.getDate()).toBe(5);
    expect(dcDate.getHours()).toBe(12);
    expect(dc.format).toBe((component as any).shortDateFormat);

    // INBOUND -> use sta
    fixture.componentRef.setInput('config', makeConfig(JourneyType.INBOUND, std, sta));
    (component as any).isOutbound = false;

    dc = component.dateConfig;
    const dcDate2 = dc.date as Date;
    expect(dcDate2.getFullYear()).toBe(2025);
    expect(dcDate2.getMonth()).toBe(8);
    expect(dcDate2.getDate()).toBe(12);
    expect(dcDate2.getHours()).toBe(12);
    expect(dc.format).toBe((component as any).shortDateFormat);
  });

  // ------------------
  // scheduleConfig default
  // ------------------

  it('should set scheduleConfig.carriersDisplayMode to OPERATED_BY by default', () => {
    expect(component.scheduleConfig.carriersDisplayMode).toBe(CarriersDisplayMode.OPERATED_BY);
  });

  // ------------------
  // setOperatingCarriers
  // ------------------

  it('setOperatingCarriers should call CarrierMapperService and deduplicate carriers by operatingAirlineCode', () => {
    const segments = [
      { transport: { carrier: { code: 'AV', name: 'Avianca', operatingAirlineCode: 'AV' } } },
      { transport: { carrier: { code: 'LA', name: 'LATAM', operatingAirlineCode: 'LA' } } },
      { transport: { carrier: { code: 'AV', name: 'Avianca', operatingAirlineCode: 'AV' } } },
    ];
    
    fixture.componentRef.setInput('config', {
      journey: {
        journeyType: JourneyType.OUTBOUND,
        schedule: { std: new Date(), sta: new Date() },
        segments,
      },
    } as any);

    (component as any).setOperatingCarriers();

    expect(carrierMapperServiceMock.getUniqueOperatingCarriers).toHaveBeenCalledWith(jasmine.anything());
    // With deduplication, we should get only unique carriers based on operatingAirlineCode (or code/name fallback)
    expect(component.operatingCarriers).toEqual([
      { name: 'Avianca' },
      { name: 'LATAM' },
    ]);
  });

  it('setOperatingCarriers should return empty array when there are no segments', () => {
    fixture.componentRef.setInput('config', {
      journey: {
        journeyType: JourneyType.OUTBOUND,
        schedule: { std: new Date(), sta: new Date() },
        segments: [],
      },
    } as any);

    (component as any).setOperatingCarriers();

    expect(carrierMapperServiceMock.getUniqueOperatingCarriers).toHaveBeenCalledWith([]);
    expect(component.operatingCarriers).toEqual([]);
  });

  it('setOperatingCarriers should handle single segment correctly', () => {
    const segments = [{ transport: { carrier: { code: 'VH', name: 'Viva Air', operatingAirlineCode: 'VH' } } }];
    
    fixture.componentRef.setInput('config', {
      journey: {
        journeyType: JourneyType.OUTBOUND,
        schedule: { std: new Date(), sta: new Date() },
        segments,
      },
    } as any);

    (component as any).setOperatingCarriers();

    expect(carrierMapperServiceMock.getUniqueOperatingCarriers).toHaveBeenCalledWith(jasmine.anything());
    expect(component.operatingCarriers).toEqual([{ name: 'Viva Air' }]);
  });
});
