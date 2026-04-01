import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { CultureServiceEx } from '@dcx/ui/libs';
import { DateDisplayComponent } from './date-display.component';
import { DateDisplayConfig } from './models/date-display.config';

describe('DateDisplayComponent', () => {
  let component: DateDisplayComponent;
  let fixture: ComponentFixture<DateDisplayComponent>;
  let mockCultureServiceEx: jasmine.SpyObj<CultureServiceEx>;

  const mockDate = new Date('2025-06-26T10:00:00Z');
  const mockConfig: DateDisplayConfig = {
    date: mockDate,
  };

  beforeAll(() => {
    mockCultureServiceEx = jasmine.createSpyObj('CultureServiceEx', ['getCulture']);
    mockCultureServiceEx.getCulture.and.returnValue('en-US');
  });

  beforeEach(fakeAsync(() => {
    mockCultureServiceEx.getCulture.calls.reset();

    TestBed.configureTestingModule({
      imports: [DateDisplayComponent],
      providers: [{ provide: CultureServiceEx, useValue: mockCultureServiceEx }],
    });
    TestBed.overrideTemplate(DateDisplayComponent, '<div></div>');

    fixture = TestBed.createComponent(DateDisplayComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('config', structuredClone(mockConfig));
    fixture.detectChanges();
    tick();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should call internalInit', () => {
      spyOn(component as any, 'internalInit');

      component.ngOnInit();

      expect((component as any).internalInit).toHaveBeenCalled();
    });
  });

  describe('internalInit', () => {
    it('should set default format when missing', () => {
      const testConfig: DateDisplayConfig = { date: mockDate };

      fixture.componentRef.setInput('config', testConfig);
      fixture.detectChanges();

      component['internalInit']();

      expect(component.config.format).toBe('EEE. d MMM. y');
    });

    it('should keep existing format', () => {
      const customFormat = 'dddd, MMMM D, YYYY';
      const testConfig: DateDisplayConfig = { date: mockDate, format: customFormat };

      fixture.componentRef.setInput('config', testConfig);
      fixture.detectChanges();

      component['internalInit']();

      expect(component.config.format).toBe(customFormat);
    });
  });

  describe('formatToUse', () => {
    it('should return fallback format when config.format is undefined', () => {
      component.config = { date: mockDate } as DateDisplayConfig;

      expect(component.formatToUse).toBe('EEE. d MMM. y');
    });

    it('should return provided format when available', () => {
      component.config = { date: mockDate, format: 'dddd, MMMM D, YYYY' };

      expect(component.formatToUse).toBe('dddd, MMMM D, YYYY');
    });
  });

  describe('parseDate', () => {
    it('should map CLDR tokens to dayjs tokens and capitalize the result', () => {
      const result = component.parseDate(mockDate, 'EEE. d MMM. y');

      expect(result).toBe('Thu. 26 Jun. 2025');
    });

    it('should prioritize CultureServiceEx over config culture', () => {
      mockCultureServiceEx.getCulture.and.returnValue('es');
      component.config = { date: mockDate, format: 'dddd, MMMM D, YYYY', culture: 'en-US' };

      const result = component.parseDate(mockDate, 'dddd, MMMM D, YYYY');

      expect(result.startsWith('Jueves')).toBeTrue();
      mockCultureServiceEx.getCulture.and.returnValue('en-US'); // reset
    });

    it('should use config culture as fallback when CultureServiceEx returns undefined', () => {
      mockCultureServiceEx.getCulture.and.returnValue(undefined as any);
      component.config = { date: mockDate, format: 'dddd, MMMM D, YYYY', culture: 'es' };

      const result = component.parseDate(mockDate, 'dddd, MMMM D, YYYY');

      expect(result.startsWith('Jueves')).toBeTrue();
      mockCultureServiceEx.getCulture.and.returnValue('en-US'); // reset
    });

    it('should fallback to "en" when both service and config culture are unavailable', () => {
      mockCultureServiceEx.getCulture.and.returnValue(undefined as any);
      component.config = { date: mockDate, format: 'dddd, MMMM D, YYYY' };

      const result = component.parseDate(mockDate, 'dddd, MMMM D, YYYY');

      expect(result.startsWith('Thursday')).toBeTrue();
      mockCultureServiceEx.getCulture.and.returnValue('en-US'); // reset
    });
  });
});
