import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChangeDetectionStrategy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { SummaryCartScheduleComponent } from './summary-cart-schedule.component';

import { JourneyVM } from '@dcx/ui/libs';
import { CarriersDisplayMode, LegsDetails, ScheduleConfig, ScheduleService, ScheduleTimeComparison } from '../../../../schedules';

describe('SummaryCartScheduleComponent', () => {
  let fixture: ComponentFixture<SummaryCartScheduleComponent>;
  let component: SummaryCartScheduleComponent;

  // Mocks
  const translateServiceMock = {
    instant: jasmine.createSpy('instant').and.callFake((key: string) => key),
  } as unknown as jasmine.SpyObj<TranslateService>;

  const scheduleServiceMock = {
    getTotalDays: jasmine.createSpy('getTotalDays').and.returnValue(5),
    buildLegsDetails: jasmine.createSpy('buildLegsDetails').and.returnValue({ legs: [] } as unknown as LegsDetails),
    getDepartureTimeComparison: jasmine.createSpy('getDepartureTimeComparison').and.returnValue({
      base: '10:00',
      compare: '10:15',
    } as unknown as ScheduleTimeComparison),
    getArrivalTimeComparison: jasmine.createSpy('getArrivalTimeComparison').and.returnValue({
      base: '20:00',
      compare: '20:30',
    } as unknown as ScheduleTimeComparison),
  } as unknown as jasmine.SpyObj<ScheduleService>;

  const makeJourney = (): JourneyVM => ({
    segments: [
      { transport: { carrier: { code: 'AV', name: 'Avianca' }, number: '123' } },
      { transport: { carrier: { code: 'LA', name: 'LATAM' }, number: '456' } },
    ],
  } as unknown as JourneyVM);

  beforeEach(() => {
    // Reset spies per test (isolation)
    translateServiceMock.instant.calls?.reset?.();
    scheduleServiceMock.getTotalDays.calls.reset();
    scheduleServiceMock.buildLegsDetails.calls.reset();
    scheduleServiceMock.getDepartureTimeComparison.calls.reset();
    scheduleServiceMock.getArrivalTimeComparison.calls.reset();

    TestBed.configureTestingModule({
      imports: [SummaryCartScheduleComponent],
      providers: [
        { provide: TranslateService, useValue: translateServiceMock },
        { provide: ScheduleService, useValue: scheduleServiceMock },
      ]
    });
    // Shallow template – no DOM/ARIA assertions in this spec
    TestBed.overrideComponent(SummaryCartScheduleComponent, {
      set: { template: '<div></div>', changeDetection: ChangeDetectionStrategy.Default }
    });

    fixture = TestBed.createComponent(SummaryCartScheduleComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // ------------------
  // carriersDisplayModeResolved
  // ------------------

  it('should resolve carriersDisplayModeResolved from config or fallback to OPERATED_BY', () => {
    fixture.componentRef.setInput('config', { carriersDisplayMode: CarriersDisplayMode.OPERATED_BY } as ScheduleConfig);
    fixture.detectChanges(); // triggers ngOnChanges
    expect(component.carriersDisplayModeResolved).toBe(CarriersDisplayMode.OPERATED_BY);

    fixture.componentRef.setInput('config', {} as ScheduleConfig);
    fixture.detectChanges();
    expect(component.carriersDisplayModeResolved).toBe(CarriersDisplayMode.OPERATED_BY);
  });


  // ------------------
  // ngOnChanges
  // ------------------

  it('ngOnChanges (via setInput) should build legs, carrierNumbers, operatingCarriers, and call scheduleService methods', () => {
    const fakeDeparture = { dep: 'something' } as any;
    const fakeArrival = { arr: 'something' } as any;
    scheduleServiceMock.getDepartureTimeComparison.and.returnValue(fakeDeparture);
    scheduleServiceMock.getArrivalTimeComparison.and.returnValue(fakeArrival);

    fixture.componentRef.setInput('data', makeJourney());
    fixture.componentRef.setInput('config', { carriersDisplayMode: CarriersDisplayMode.OPERATED_BY } as ScheduleConfig);
    fixture.detectChanges();

    expect(scheduleServiceMock.getTotalDays).toHaveBeenCalledWith(component.data);
    expect(scheduleServiceMock.buildLegsDetails).toHaveBeenCalledWith(component.data);
    expect(scheduleServiceMock.getDepartureTimeComparison).toHaveBeenCalledWith(component.data);
    expect(scheduleServiceMock.getArrivalTimeComparison).toHaveBeenCalledWith(component.data);

    expect(component.totalDaysOfJourney).toBe(5);
    expect(component.legsDetails).toEqual({ legs: [] } as any);
    expect(component.carrierNumbers).toEqual([
      { code: 'AV', number: '123' },
      { code: 'LA', number: '456' },
    ]);
    expect(component.departureTime).toBe(fakeDeparture);
    expect(component.arrivalTime).toBe(fakeArrival);
  });

  it('ngOnChanges should do nothing if data is undefined', () => {
    fixture.componentRef.setInput('data', undefined as any);
    fixture.componentRef.setInput('config', {} as ScheduleConfig);
    fixture.detectChanges();
    expect(scheduleServiceMock.getTotalDays).not.toHaveBeenCalled();
    expect(component.carrierNumbers).toEqual([]);
  });
});
