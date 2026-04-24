import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { ComponentRef } from '@angular/core';
import { of } from 'rxjs';
import { ScheduleExtraDayComponent } from './schedule-extra-day.component';

class FakeLoader implements TranslateLoader {
  getTranslation() {
    return of({});
  }
}

describe('ScheduleExtraDayComponent', () => {
  let component: ScheduleExtraDayComponent;
  let fixture: ComponentFixture<ScheduleExtraDayComponent>;
  let translateService: jasmine.SpyObj<TranslateService>;
  let componentRef: ComponentRef<ScheduleExtraDayComponent>;

  beforeEach(async () => {
    translateService = jasmine.createSpyObj('TranslateService', ['instant']);
    translateService.instant.and.callFake((key: string, params?: any) => {
      if (key === 'Schedule.ExtraDay.Day_Label') return 'day';
      if (key === 'Schedule.ExtraDay.Days_Label') return 'days';
      if (key === 'Schedule.ExtraDay.Arrival_NextDay') return 'Arrival next day';
      if (key === 'Schedule.ExtraDay.Arrival_NDaysLater') return `Arrival ${params.count} days later`;
      return key;
    });

    await TestBed.configureTestingModule({
      imports: [
        ScheduleExtraDayComponent,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: FakeLoader },
        }),
      ],
      providers: [{ provide: TranslateService, useValue: translateService }],
    }).compileComponents();

    fixture = TestBed.createComponent(ScheduleExtraDayComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('label computed signal', () => {
    it('should return empty string when totalDays is less than 1', () => {
      componentRef.setInput('totalDays', 0);
      expect(component.label()).toBe('');

      componentRef.setInput('totalDays', -1);
      expect(component.label()).toBe('');
    });

    it('should return "+1 day" for single day', () => {
      componentRef.setInput('totalDays', 1);
      expect(component.label()).toBe('+1 day');
    });

    it('should return "+N days" for multiple days', () => {
      componentRef.setInput('totalDays', 3);
      expect(component.label()).toBe('+3 days');
    });

    it('should use correct translation keys', () => {
      componentRef.setInput('totalDays', 1);
      component.label();
      expect(translateService.instant).toHaveBeenCalledWith('Schedule.ExtraDay.Day_Label');

      translateService.instant.calls.reset();
      componentRef.setInput('totalDays', 2);
      component.label();
      expect(translateService.instant).toHaveBeenCalledWith('Schedule.ExtraDay.Days_Label');
    });
  });

  describe('ariaLabel computed signal', () => {
    it('should return empty string when totalDays is less than 1', () => {
      componentRef.setInput('totalDays', 0);
      expect(component.ariaLabel()).toBe('');

      componentRef.setInput('totalDays', -1);
      expect(component.ariaLabel()).toBe('');
    });

    it('should return "Arrival next day" for 1 day', () => {
      componentRef.setInput('totalDays', 1);
      expect(component.ariaLabel()).toBe('Arrival next day');
    });

    it('should return "Arrival N days later" for multiple days', () => {
      componentRef.setInput('totalDays', 3);
      expect(component.ariaLabel()).toBe('Arrival 3 days later');
    });

    it('should use correct translation keys with params', () => {
      componentRef.setInput('totalDays', 1);
      component.ariaLabel();
      expect(translateService.instant).toHaveBeenCalledWith('Schedule.ExtraDay.Arrival_NextDay');

      translateService.instant.calls.reset();
      componentRef.setInput('totalDays', 5);
      component.ariaLabel();
      expect(translateService.instant).toHaveBeenCalledWith('Schedule.ExtraDay.Arrival_NDaysLater', {
        count: 5,
      });
    });
  });

  describe('template rendering', () => {
    it('should not render when totalDays is less than 1', () => {
      componentRef.setInput('totalDays', 0);
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.schedule-extra-day-inner')).toBeNull();

      componentRef.setInput('totalDays', -1);
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.schedule-extra-day-inner')).toBeNull();
    });

    it('should render when totalDays is 1 or more', () => {
      componentRef.setInput('totalDays', 1);
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.schedule-extra-day-inner')).toBeTruthy();
    });

    it('should display correct label and aria-label', () => {
      componentRef.setInput('totalDays', 2);
      fixture.detectChanges();

      const innerElement = fixture.nativeElement.querySelector('.schedule-extra-day-inner');
      const ariaHiddenSpan = fixture.nativeElement.querySelector('[aria-hidden="true"]');

      expect(ariaHiddenSpan.textContent?.trim()).toBe('+2 days');
      expect(innerElement.getAttribute('aria-label')).toBe('Arrival 2 days later');
    });

    it('should update when totalDays changes', () => {
      componentRef.setInput('totalDays', 1);
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('[aria-hidden="true"]').textContent?.trim()).toBe('+1 day');

      componentRef.setInput('totalDays', 0);
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.schedule-extra-day-inner')).toBeNull();

      componentRef.setInput('totalDays', 3);
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('[aria-hidden="true"]').textContent?.trim()).toBe('+3 days');
    });
  });

  describe('accessibility', () => {
    it('should provide different visual and accessible labels', () => {
      componentRef.setInput('totalDays', 1);
      fixture.detectChanges();

      expect(component.label()).toBe('+1 day');
      expect(component.ariaLabel()).toBe('Arrival next day');
    });

    it('should hide visual label from screen readers', () => {
      componentRef.setInput('totalDays', 2);
      fixture.detectChanges();

      const ariaHiddenSpan = fixture.nativeElement.querySelector('[aria-hidden="true"]');
      expect(ariaHiddenSpan.getAttribute('aria-hidden')).toBe('true');
    });
  });
});
