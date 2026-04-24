import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { JourneyStatusComponent } from './journey-status-tag.component';
import { JourneyStatus } from '@dcx/ui/libs';
import { StatusTagType } from '@dcx/ui/design-system';

/**
 * Fake loader: avoids external HTTP for translations.
 */
class FakeLoader implements TranslateLoader {
  getTranslation(_lang: string) {
    return of({});
  }
}

describe('JourneyStatusComponent', () => {
  let component: JourneyStatusComponent;
  let fixture: ComponentFixture<JourneyStatusComponent>;
  let mockTranslateService: jasmine.SpyObj<TranslateService>;

  beforeEach(async () => {
    mockTranslateService = jasmine.createSpyObj('TranslateService', ['instant']);
    mockTranslateService.instant.and.returnValue('Translated Status');

    await TestBed.configureTestingModule({
      imports: [
        JourneyStatusComponent,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: FakeLoader },
        }),
      ],
      providers: [{ provide: TranslateService, useValue: mockTranslateService }],
    }).compileComponents();

    fixture = TestBed.createComponent(JourneyStatusComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('status', JourneyStatus.ON_TIME);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('configuration on initialization', () => {
    it('should configure journeyStatusTagConfig with translated text and correct status type', () => {
      mockTranslateService.instant.and.returnValue('On Time');
      fixture.componentRef.setInput('status', JourneyStatus.ON_TIME);

      component.ngOnInit();

      expect(component.journeyStatusTagConfig).toBeDefined();
      expect(component.journeyStatusTagConfig.text).toBe('On Time');
      expect(component.journeyStatusTagConfig.status).toBe(StatusTagType.SUCCESS);
      expect(mockTranslateService.instant).toHaveBeenCalledWith('Journey.Status.OnTime');
    });

    it('should handle CANCELLED status correctly', () => {
      mockTranslateService.instant.and.returnValue('Cancelled');
      fixture.componentRef.setInput('status', JourneyStatus.CANCELLED);

      component.ngOnInit();

      expect(component.journeyStatusTagConfig.text).toBe('Cancelled');
      expect(component.journeyStatusTagConfig.status).toBe(StatusTagType.ERROR);
      expect(mockTranslateService.instant).toHaveBeenCalledWith('Journey.Status.Cancelled');
    });

    it('should handle DELAYED status correctly', () => {
      mockTranslateService.instant.and.returnValue('Delayed');
      fixture.componentRef.setInput('status', JourneyStatus.DELAYED);

      component.ngOnInit();

      expect(component.journeyStatusTagConfig.text).toBe('Delayed');
      expect(component.journeyStatusTagConfig.status).toBe(StatusTagType.WARNING);
      expect(mockTranslateService.instant).toHaveBeenCalledWith('Journey.Status.Delayed');
    });
  });

  describe('status type mapping', () => {
    it('should map SUCCESS statuses correctly', () => {
      const successStatuses = [
        JourneyStatus.LANDED,
        JourneyStatus.ON_TIME,
        JourneyStatus.ON_ROUTE,
        JourneyStatus.OPEN,
        JourneyStatus.DEPARTED,
        JourneyStatus.CONFIRMED,
      ];

      successStatuses.forEach((status) => {
        fixture.componentRef.setInput('status', status);
        component.ngOnInit();

        expect(component.journeyStatusTagConfig.status).toBe(
          StatusTagType.SUCCESS,
          `Status ${status} should map to SUCCESS`
        );
      });
    });

    it('should map WARNING statuses correctly', () => {
      const warningStatuses = [JourneyStatus.CLOSED, JourneyStatus.DIVERTED, JourneyStatus.DELAYED, JourneyStatus.RETURNED];

      warningStatuses.forEach((status) => {
        fixture.componentRef.setInput('status', status);
        component.ngOnInit();

        expect(component.journeyStatusTagConfig.status).toBe(
          StatusTagType.WARNING,
          `Status ${status} should map to WARNING`
        );
      });
    });

    it('should map ERROR status correctly', () => {
      fixture.componentRef.setInput('status', JourneyStatus.CANCELLED);
      
      component.ngOnInit();

      expect(component.journeyStatusTagConfig.status).toBe(StatusTagType.ERROR);
    });

    it('should default to SUCCESS for unknown status', () => {
      fixture.componentRef.setInput('status', 'UNKNOWN_STATUS' as JourneyStatus);

      component.ngOnInit();

      expect(component.journeyStatusTagConfig.status).toBe(StatusTagType.SUCCESS);
    });
  });

  describe('translation keys', () => {
    it('should use correct translation key format for each status', () => {
      const statusTranslationMap = [
        { status: JourneyStatus.ON_TIME, key: 'Journey.Status.OnTime' },
        { status: JourneyStatus.DELAYED, key: 'Journey.Status.Delayed' },
        { status: JourneyStatus.CANCELLED, key: 'Journey.Status.Cancelled' },
        { status: JourneyStatus.LANDED, key: 'Journey.Status.Landed' },
      ];

      statusTranslationMap.forEach(({ status, key }) => {
        mockTranslateService.instant.calls.reset();
        fixture.componentRef.setInput('status', status);

        component.ngOnInit();

        expect(mockTranslateService.instant).toHaveBeenCalledWith(key);
      });
    });
  });
});
