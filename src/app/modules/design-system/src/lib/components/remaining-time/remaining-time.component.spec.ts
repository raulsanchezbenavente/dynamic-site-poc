import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RemainingTimeComponent } from './remaining-time.component';
import { TranslateService } from '@ngx-translate/core';
import { RemainingTimeConfig } from './models/remaining-time-config.model';
import { DurationFormatterService, TimeMeasureModel } from '@dcx/ui/libs';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'translate' })
class TranslatePipeStub implements PipeTransform {
  transform(value: any): any { return value; } // devuelve la key tal cual
}

describe('RemainingTimeComponent', () => {
  let component: RemainingTimeComponent;
  let fixture: ComponentFixture<RemainingTimeComponent>;

  // Centralized mocks
  let durationFormatterServiceMock: jasmine.SpyObj<DurationFormatterService>;
  let translateServiceMock: jasmine.SpyObj<TranslateService>;

  beforeEach(fakeAsync(() => {
    durationFormatterServiceMock = jasmine.createSpyObj<DurationFormatterService>('DurationFormatterService', ['format']);
    translateServiceMock = jasmine.createSpyObj<TranslateService>('TranslateService', ['getCurrentLang']);
    translateServiceMock.getCurrentLang.and.returnValue('es');

    durationFormatterServiceMock.format.and.callFake((value: any) =>
      Object.entries(value).filter(([, v]) => v).map(([k, v]) => `${v} ${k}`).join(' ')
    );

    TestBed.configureTestingModule({
      imports: [TranslatePipeStub, RemainingTimeComponent],
      providers: [
        { provide: DurationFormatterService, useValue: durationFormatterServiceMock },
        { provide: TranslateService, useValue: translateServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RemainingTimeComponent);
    component = fixture.componentInstance;
  }));

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should build remaining text with days and hours when days >= 1', fakeAsync(() => {
    // Arrange
    component.timeMeasure = { days: 1, hours: 5, minutes: 30, seconds: 10 } as TimeMeasureModel;
    component.config = { joinStyle: 'comma' } as RemainingTimeConfig;

    // Act
    component.ngOnInit();
    tick();

    // Assert
    expect(durationFormatterServiceMock.format).toHaveBeenCalledTimes(2);
    expect(component.remainingText).toBe('1 days, 5 hours.');
  }));

  it('should build remaining text with hours and minutes when < 1 day but minutes > 0', fakeAsync(() => {
    component.timeMeasure = { days: 0, hours: 2, minutes: 45, seconds: 0 };
    component.config = { joinStyle: 'comma', labelDictionaryKey: 'CheckIn' };

    component.ngOnInit();
    tick();

    expect(durationFormatterServiceMock.format).toHaveBeenCalledTimes(2);
    expect(component.remainingText).toBe('2 hours, 45 minutes.');
  }));

  it('should build remaining text with hours only when minutes and days are 0', fakeAsync(() => {
    component.timeMeasure = { days: 0, hours: 3, minutes: 0, seconds: 0 };
    component.config = { joinStyle: 'comma', labelDictionaryKey: 'CheckIn' };

    component.ngOnInit();
    tick();

    expect(durationFormatterServiceMock.format).toHaveBeenCalledTimes(1);
    expect(component.remainingText).toBe('3 hours.');
  }));

  it('should build remaining text with seconds when only seconds > 0', fakeAsync(() => {
    component.timeMeasure = { days: 0, hours: 0, minutes: 0, seconds: 25 };
    component.config = { joinStyle: 'comma', labelDictionaryKey: 'CheckIn' };

    component.ngOnInit();
    tick();

    expect(durationFormatterServiceMock.format).toHaveBeenCalledTimes(1);
    expect(component.remainingText).toBe('25 seconds.');
  }));

  it('should return empty string if all time measures are 0', fakeAsync(() => {
    component.timeMeasure = { days: 0, hours: 0, minutes: 0, seconds: 0 };
    component.config = { joinStyle: 'comma', labelDictionaryKey: 'CheckIn' };

    component.ngOnInit();
    tick();

    expect(component.remainingText).toBe('');
    expect(durationFormatterServiceMock.format).not.toHaveBeenCalled();
  }));

  it('should join with conjunction when joinStyle = "conjunction"', fakeAsync(() => {
    // Arrange
    component.timeMeasure = { days: 0, hours: 1, minutes: 30, seconds: 0 };
    component.config = { joinStyle: 'conjunction', labelDictionaryKey: 'CheckIn' };
    translateServiceMock.getCurrentLang.and.returnValue('es');

    // Act
    component.ngOnInit();
    tick();

    // Assert
    expect(durationFormatterServiceMock.format).toHaveBeenCalledTimes(2);
    // Intl.ListFormat('es', { type: 'conjunction' }) → "1 hours y 30 minutes."
    expect(component.remainingText).toContain('y');
    expect(component.remainingText.endsWith('.')).toBeTrue();
  }));

  it('should call durationFormatterService with correct options', fakeAsync(() => {
    component.timeMeasure = { days: 0, hours: 2, minutes: 10, seconds: 0 };
    component.config = { joinStyle: 'comma', labelDictionaryKey: 'CheckIn' };

    component.ngOnInit();
    tick();

    const args = durationFormatterServiceMock.format.calls.mostRecent().args;
    expect(args[1]).toEqual({ style: 'long', trimZeros: true });
  }));

  it('should handle negative values by converting them to 0', fakeAsync(() => {
    component.timeMeasure = { days: -1, hours: -5, minutes: 0, seconds: -10 };
    component.config = { joinStyle: 'comma', labelDictionaryKey: 'CheckIn' };

    component.ngOnInit();
    tick();

    expect(durationFormatterServiceMock.format).not.toHaveBeenCalled();
    expect(component.remainingText).toBe('');
  }));
});
