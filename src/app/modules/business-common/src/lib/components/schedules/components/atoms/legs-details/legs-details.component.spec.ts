import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { ChangeDetectorRef } from '@angular/core';
import { of } from 'rxjs';
import { LegsDetailsComponent } from './legs-details.component';
import { LegsDetails } from './models/legs-details.config';
import { dateHelper, DsNgbTriggerEvent } from '@dcx/ui/libs';

class FakeLoader implements TranslateLoader {
  getTranslation() {
    return of({});
  }
}

describe('LegsDetailsComponent', () => {
  let component: LegsDetailsComponent;
  let fixture: ComponentFixture<LegsDetailsComponent>;
  let translateService: jasmine.SpyObj<TranslateService>;

  const mockLegsDetails: LegsDetails = {
    model: {
      duration: '5h 30m',
      stopsNumber: 1,
      legs: [
        {
          origin: 'MIA',
          destination: 'BOG',
          duration: '3h 0m',
          std: new Date('2026-01-15T10:00:00'),
          stdutc: new Date('2026-01-15T15:00:00Z'),
          sta: new Date('2026-01-15T13:00:00'),
          stautc: new Date('2026-01-15T18:00:00Z'),
          transport: {
            carrier: {
              code: 'AV',
              name: 'Avianca',
            },
          } as any,
        } as any,
        {
          origin: 'BOG',
          destination: 'LIM',
          duration: '2h 30m',
          std: new Date('2026-01-15T14:30:00'),
          stdutc: new Date('2026-01-15T19:30:00Z'),
          sta: new Date('2026-01-15T17:00:00'),
          stautc: new Date('2026-01-15T22:00:00Z'),
          transport: {
            carrier: {
              code: 'AV',
              name: 'Avianca',
            },
          } as any,
        } as any,
      ],
    },
  };

  beforeEach(async () => {
    translateService = jasmine.createSpyObj('TranslateService', ['instant']);
    translateService.instant.and.returnValue('Connection Details');

    await TestBed.configureTestingModule({
      imports: [
        LegsDetailsComponent,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: FakeLoader },
        }),
      ],
      providers: [
        { provide: TranslateService, useValue: translateService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LegsDetailsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    beforeEach(() => {
      component.data = mockLegsDetails;
      spyOn(dateHelper, 'dateDiff').and.returnValue({ hours: 1, minutes: 30 });
      spyOn(dateHelper, 'convertToTimespan').and.returnValue('01:30:00');
    });

    it('should initialize popover configuration', () => {
      component.ngOnInit();

      expect(component.popoverConfig).toBeDefined();
      expect(component.popoverConfig.placement).toBe('bottom');
      expect(component.popoverConfig.customClass).toBe('popover-journey-details');
      expect(component.popoverConfig.triggers).toBe(DsNgbTriggerEvent.CLICK);
      expect(component.popoverConfig.popoverHeaderConfig?.title).toBe('Connection Details');
      expect(translateService.instant).toHaveBeenCalledWith('Schedule.Connection_Title');
    });

    it('should initialize stop durations and stopovers', () => {
      component.ngOnInit();

      expect(component.stopDurations).toBeDefined();
      expect(component.stopOvers).toBeDefined();
      expect(Array.isArray(component.stopDurations)).toBe(true);
      expect(Array.isArray(component.stopOvers)).toBe(true);
    });
  });

  describe('Stop Durations Calculation', () => {
    it('should calculate stop durations between consecutive legs', () => {
      component.data = mockLegsDetails;
      spyOn(dateHelper, 'dateDiff').and.returnValue({ hours: 1, minutes: 30 });
      spyOn(dateHelper, 'convertToTimespan').and.returnValue('01:30:00');

      component.ngOnInit();

      expect(component.stopDurations.length).toBe(2);
      expect(component.stopDurations[0]).toBe('01:30:00');
      expect(component.stopDurations[1]).toBe('');
      expect(dateHelper.dateDiff).toHaveBeenCalled();
      expect(dateHelper.convertToTimespan).toHaveBeenCalledWith(1, 30, 0);
    });

    it('should return empty string for negative time differences', () => {
      component.data = mockLegsDetails;
      spyOn(dateHelper, 'dateDiff').and.returnValue({ hours: -1, minutes: 30 });

      component.ngOnInit();

      expect(component.stopDurations[0]).toBe('');
    });

    it('should handle single leg journey', () => {
      component.data = {
        model: {
          duration: '3h 0m',
          stopsNumber: 0,
          legs: [mockLegsDetails.model.legs[0]],
        },
      };

      component.ngOnInit();

      expect(component.stopDurations.length).toBe(1);
      expect(component.stopDurations[0]).toBe('');
    });

    it('should handle multiple legs with different durations', () => {
      component.data = {
        model: {
          duration: '8h 0m',
          stopsNumber: 2,
          legs: [
            mockLegsDetails.model.legs[0],
            mockLegsDetails.model.legs[1],
            mockLegsDetails.model.legs[0],
          ],
        },
      };
      spyOn(dateHelper, 'dateDiff').and.returnValues({ hours: 1, minutes: 30 }, { hours: 2, minutes: 45 });
      spyOn(dateHelper, 'convertToTimespan').and.returnValues('01:30:00', '02:45:00');

      component.ngOnInit();

      expect(component.stopDurations.length).toBe(3);
      expect(component.stopDurations[0]).toBe('01:30:00');
      expect(component.stopDurations[1]).toBe('02:45:00');
      expect(component.stopDurations[2]).toBe('');
    });

    it('should handle zero duration stop', () => {
      component.data = mockLegsDetails;
      spyOn(dateHelper, 'dateDiff').and.returnValue({ hours: 0, minutes: 0 });
      spyOn(dateHelper, 'convertToTimespan').and.returnValue('00:00:00');

      component.ngOnInit();

      expect(component.stopDurations[0]).toBe('00:00:00');
      expect(dateHelper.convertToTimespan).toHaveBeenCalledWith(0, 0, 0);
    });
  });

  describe('Stopover Detection', () => {
    it('should identify same carrier connections as stopovers', () => {
      component.data = mockLegsDetails;

      component.ngOnInit();

      expect(component.stopOvers.length).toBe(2);
      expect(component.stopOvers[0]).toBe(true);
      expect(component.stopOvers[1]).toBe(false);
    });

    it('should identify different carriers as not stopovers', () => {
      component.data = {
        model: {
          duration: '8h 0m',
          stopsNumber: 1,
          legs: [
            {
              ...mockLegsDetails.model.legs[0],
              transport: {
                carrier: { code: 'AV', name: 'Avianca' },
              } as any,
            },
            {
              ...mockLegsDetails.model.legs[1],
              transport: {
                carrier: { code: 'CO', name: 'Copa Airlines' },
              } as any,
            },
          ],
        },
      };

      component.ngOnInit();

      expect(component.stopOvers[0]).toBe(false);
    });

    it('should handle multiple legs with mixed carriers', () => {
      component.data = {
        model: {
          duration: '10h 0m',
          stopsNumber: 3,
          legs: [
            {
              ...mockLegsDetails.model.legs[0],
              transport: { carrier: { code: 'AV', name: 'Avianca' } } as any,
            },
            {
              ...mockLegsDetails.model.legs[1],
              transport: { carrier: { code: 'AV', name: 'Avianca' } } as any,
            },
            {
              ...mockLegsDetails.model.legs[0],
              transport: { carrier: { code: 'CO', name: 'Copa Airlines' } } as any,
            },
            {
              ...mockLegsDetails.model.legs[1],
              transport: { carrier: { code: 'CO', name: 'Copa Airlines' } } as any,
            },
          ],
        },
      };

      component.ngOnInit();

      expect(component.stopOvers.length).toBe(4);
      expect(component.stopOvers[0]).toBe(true);
      expect(component.stopOvers[1]).toBe(false);
      expect(component.stopOvers[2]).toBe(true);
      expect(component.stopOvers[3]).toBe(false);
    });

    it('should compare carrier codes case-sensitively', () => {
      component.data = {
        model: {
          duration: '6h 0m',
          stopsNumber: 1,
          legs: [
            {
              ...mockLegsDetails.model.legs[0],
              transport: { carrier: { code: 'AV', name: 'Avianca' } } as any,
            },
            {
              ...mockLegsDetails.model.legs[1],
              transport: { carrier: { code: 'av', name: 'Avianca' } } as any,
            },
          ],
        },
      };

      component.ngOnInit();

      expect(component.stopOvers[0]).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty legs array', () => {
      component.data = {
        model: {
          duration: '0h 0m',
          stopsNumber: 0,
          legs: [],
        },
      };

      component.ngOnInit();

      expect(component.stopDurations).toEqual([]);
      expect(component.stopOvers).toEqual([]);
    });

    it('should handle complex journey with multiple stops', () => {
      const complexJourney: LegsDetails = {
        model: {
          duration: '15h 30m',
          stopsNumber: 3,
          legs: [
            mockLegsDetails.model.legs[0],
            mockLegsDetails.model.legs[1],
            mockLegsDetails.model.legs[0],
            mockLegsDetails.model.legs[1],
          ],
        },
      };
      component.data = complexJourney;
      spyOn(dateHelper, 'dateDiff').and.returnValue({ hours: 2, minutes: 15 });
      spyOn(dateHelper, 'convertToTimespan').and.returnValue('02:15:00');

      component.ngOnInit();

      expect(component.stopDurations.length).toBe(4);
      expect(component.stopOvers.length).toBe(4);
    });
  });

  describe('Popover Configuration Override', () => {
    beforeEach(() => {
      component.data = mockLegsDetails;
      spyOn(dateHelper, 'dateDiff').and.returnValue({ hours: 1, minutes: 30 });
      spyOn(dateHelper, 'convertToTimespan').and.returnValue('01:30:00');
    });

    it('should use default popover configuration when no override is provided', () => {
      component.popoverConfigOverride = undefined;
      component.ngOnInit();

      expect(component.popoverConfig).toBeDefined();
      expect(component.popoverConfig.placement).toBe('bottom');
      expect(component.popoverConfig.customClass).toBe('popover-journey-details');
      expect(component.popoverConfig.triggers).toBe(DsNgbTriggerEvent.CLICK);
      expect(component.popoverConfig.autoClose).toBe('outside');
      expect(component.popoverConfig.responsiveOffCanvas).toBe(true);
      expect(component.popoverConfig.popoverHeaderConfig?.title).toBe('Connection Details');
    });

    it('should partially override popover configuration when only placement is provided', () => {
      component.popoverConfigOverride = {
        placement: 'top',
      };
      component.ngOnInit();

      expect(component.popoverConfig.placement).toBe('top');
      expect(component.popoverConfig.customClass).toBe('popover-journey-details');
      expect(component.popoverConfig.triggers).toBe(DsNgbTriggerEvent.CLICK);
      expect(component.popoverConfig.autoClose).toBe('outside');
      expect(component.popoverConfig.responsiveOffCanvas).toBe(true);
    });

    it('should partially override multiple properties when provided', () => {
      component.popoverConfigOverride = {
        placement: 'bottom',
        autoClose: true,
      };
      component.ngOnInit();

      expect(component.popoverConfig.placement).toBe('bottom');
      expect(component.popoverConfig.autoClose).toBe(true);
      expect(component.popoverConfig.customClass).toBe('popover-journey-details');
      expect(component.popoverConfig.triggers).toBe(DsNgbTriggerEvent.CLICK);
      expect(component.popoverConfig.responsiveOffCanvas).toBe(true);
    });

    it('should completely override popover configuration when all properties are provided', () => {
      component.popoverConfigOverride = {
        popoverHeaderConfig: {
          title: 'Custom Title',
        },
        placement: 'start',
        customClass: 'custom-popover-class',
        triggers: 'hover',
        autoClose: true,
        responsiveOffCanvas: false,
      };
      component.ngOnInit();

      expect(component.popoverConfig.popoverHeaderConfig?.title).toBe('Custom Title');
      expect(component.popoverConfig.placement).toBe('start');
      expect(component.popoverConfig.customClass).toBe('custom-popover-class');
      expect(component.popoverConfig.triggers).toBe('hover');
      expect(component.popoverConfig.autoClose).toBe(true);
      expect(component.popoverConfig.responsiveOffCanvas).toBe(false);
    });

    it('should merge popoverHeaderConfig properties correctly', () => {
      component.popoverConfigOverride = {
        popoverHeaderConfig: {
          title: 'Merged Title',
        },
        placement: 'bottom',
      };
      component.ngOnInit();

      expect(component.popoverConfig.popoverHeaderConfig?.title).toBe('Merged Title');
      expect(component.popoverConfig.placement).toBe('bottom');
      expect(component.popoverConfig.customClass).toBe('popover-journey-details');
    });

    it('should preserve default title when popoverHeaderConfig is not in override', () => {
      component.popoverConfigOverride = {
        placement: 'start',
        customClass: 'new-class',
      };
      component.ngOnInit();

      expect(component.popoverConfig.popoverHeaderConfig?.title).toBe('Connection Details');
      expect(component.popoverConfig.placement).toBe('start');
      expect(component.popoverConfig.customClass).toBe('new-class');
    });

    it('should handle empty popoverConfigOverride object', () => {
      component.popoverConfigOverride = {};
      component.ngOnInit();

      expect(component.popoverConfig.placement).toBe('bottom');
      expect(component.popoverConfig.customClass).toBe('popover-journey-details');
      expect(component.popoverConfig.popoverHeaderConfig?.title).toBe('Connection Details');
    });
  });
});
