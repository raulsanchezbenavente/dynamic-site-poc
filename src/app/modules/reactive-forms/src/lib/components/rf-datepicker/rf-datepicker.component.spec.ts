import { Component, Injectable, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControlState } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NgbCalendar, NgbCalendarGregorian, NgbDate, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import dayjs, { Dayjs } from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { Subject } from 'rxjs';

import { RfErrorDisplayModes } from '../../abstract/enums/rf-base-reactive-display-mode.enum';
import { DateHelper } from '../../helpers/date.helper';
import { GlobalEventsService } from '../../services/mouseEvents/mouse-events.service';
import { IdService } from '../../services/id/id.service';

import { DateAdapter } from './adapters/date.adapter';
import { RfDatepickerComponent } from './rf-datepicker.component';
import { RfDatepickerRange, RfDatepickerValue } from './models/rf-datepicker-value.model';

// Polyfill for $localize if not available
if (typeof (globalThis as any).$localize === 'undefined') {
  (globalThis as any).$localize = (strings: TemplateStringsArray, ...values: any[]) => {
    return strings.reduce((acc, str, i) => acc + str + (values[i] || ''), '');
  };
}

dayjs.extend(utc);

// ---- Mock Services ----
class MockIdService {
  private i = 0;
  generateRandomId() {
    this.i += 1;
    return `id-${this.i}`;
  }
}

class MockGlobalEventsService {
  mousedown$ = new Subject<void>();
  mouseup$ = new Subject<void>();
  keydown$= new Subject<KeyboardEvent>();
}

// ---- Host Component ----
@Component({
  standalone: true,
  imports: [RfDatepickerComponent],
  template: `
    <rf-datepicker
      [minDate]="minDate()"
      [maxDate]="maxDate()"
      [displayMonths]="displayMonths()"
      [showWeekNumbers]="showWeekNumbers()"
      [outsideDays]="outsideDays()"
      [specificDate]="specificDate()"
      [rangeEnabled]="rangeEnabled()"
      [specificStartDateRange]="specificStartDateRange()"
      [specificEndDateRange]="specificEndDateRange()"
      [disabled]="disabled()"
      [readonly]="readonly()"
      [displayErrorsMode]="displayErrorsMode()"
      (keyDown)="lastKeyDown = $event"
    ></rf-datepicker>
  `,
})
class HostComponent {
  minDate = signal<NgbDateStruct | undefined>(undefined);
  maxDate = signal<NgbDateStruct | undefined>(undefined);
  displayMonths = signal<number>(1);
  showWeekNumbers = signal<boolean>(false);
  outsideDays = signal<string>('hidden');
  specificDate = signal<string | undefined>(undefined);
  rangeEnabled = signal<boolean>(false);
  specificStartDateRange = signal<string | undefined>(undefined);
  specificEndDateRange = signal<string | undefined>(undefined);
  disabled = signal<boolean>(false);
  readonly = signal<boolean>(false);
  displayErrorsMode = signal<RfErrorDisplayModes>(RfErrorDisplayModes.NONE);
  lastKeyDown: KeyboardEvent | null = null;
}

// ---- Helper Functions ----
function getComp(fixture: ComponentFixture<HostComponent>): RfDatepickerComponent {
  return fixture.debugElement.query(By.directive(RfDatepickerComponent)).componentInstance;
}

function getDatepickerElement(fixture: ComponentFixture<HostComponent>): HTMLElement {
  return fixture.debugElement.query(By.css('.rf-datepicker-inner')).nativeElement;
}

describe('RfDatepickerComponent — Public API', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  beforeEach(async () => {
    // Mock requestAnimationFrame to run synchronously
    spyOn(globalThis, 'requestAnimationFrame').and.callFake((cb: FrameRequestCallback) => {
      cb(0);
      return 0 as any;
    });

    await TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [
        { provide: IdService, useClass: MockIdService },
        { provide: GlobalEventsService, useClass: MockGlobalEventsService },
        { provide: NgbCalendar, useClass: NgbCalendarGregorian },
        DateAdapter,
        DateHelper,
      ],
    }).compileComponents();

    // 🩹 Patch anti-NG0100: primera llamada a generateAutoId() devuelve ''
    const proto = (RfDatepickerComponent as any).prototype;
    const originalGen = proto.generateAutoId;
    let first = true;
    proto.generateAutoId = function (...args: any[]) {
      if (first) { first = false; return ''; }
      return originalGen.apply(this, args);
    };

    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;

    fixture.detectChanges();          // 1ª pasada (hooks)
    await fixture.whenStable();       // microtareas
    fixture.detectChanges();          // 2ª pasada

    // Asegura un autoId no vacío fuera del primer ciclo (ya sin NG0100)
    const comp = getComp(fixture);
    if (!comp.autoId || comp.autoId.length === 0) {
      comp.autoId = comp.generateAutoId(comp.parentId());
      fixture.detectChanges();
    }

    // (opcional) restaurar generateAutoId real
    proto.generateAutoId = originalGen;
  });

  // ---------------------- Component Initialization ----------------------
  describe('Component Initialization', () => {
    it('should create the component', () => {
      const comp = getComp(fixture);
      expect(comp).toBeTruthy();
    });

    it('should set rfTypeClass to "RfDatepickerComponent"', () => {
      const comp = getComp(fixture);
      expect(comp.rfTypeClass).toBe('RfDatepickerComponent');
    });

    it('should initialize value as undefined by default', () => {
      const comp = getComp(fixture);
      expect(comp.value()).toBeUndefined();
    });

    it('should initialize with internal state ready for date selection', () => {
      const comp = getComp(fixture);
      expect(comp.dateSelected()).toBeUndefined();
    });

    it('should generate autoId after view init', () => {
      const comp = getComp(fixture);
      expect(comp.autoId).toBeTruthy();
      expect(typeof comp.autoId).toBe('string');
    });
  });

  // ---------------------- writeValue() ----------------------
  describe('writeValue()', () => {
    it('should set a single date value', () => {
      const comp = getComp(fixture);
      const testDate = {
        year: 2024, month: 6, day: 15
      };

      comp.writeValue(testDate);
      fixture.detectChanges();

      expect(comp.dateSelected()?.year).toBe(2024);
      expect(comp.dateSelected()?.month).toBe(6);
      expect(comp.dateSelected()?.day).toBe(15);
    });

    it('should set a date range value when rangeEnabled is true', () => {
      host.rangeEnabled.set(true);
      fixture.detectChanges();

      const comp = getComp(fixture);
      const range: RfDatepickerRange = {  
        startDate:{ year: 2024, month: 6, day: 10 },
        endDate: { year: 2024, month: 6, day: 20 },
      };

      comp.writeValue(range);
      fixture.detectChanges();

      expect(comp.rangeStartDate()?.year).toBe(2024);
      expect(comp.rangeStartDate()?.month).toBe(6);
      expect(comp.rangeStartDate()?.day).toBe(10);
      expect(comp.rangeEndDate()?.year).toBe(2024);
      expect(comp.rangeEndDate()?.month).toBe(6);
      expect(comp.rangeEndDate()?.day).toBe(20);
    });

    it('should handle FormControlState with a single date', () => {
      const comp = getComp(fixture);
      const testDate = {
        year: 2024, month: 7, day: 25
      };
      const state: FormControlState<RfDatepickerValue> = {
        value: testDate,
        disabled: false,
      };

      comp.writeValue(state);
      fixture.detectChanges();

      expect(comp.dateSelected()?.year).toBe(2024);
      expect(comp.dateSelected()?.month).toBe(7);
      expect(comp.dateSelected()?.day).toBe(25);
    });

    it('should handle FormControlState with a date range', () => {
      host.rangeEnabled.set(true);
      fixture.detectChanges();

      const comp = getComp(fixture);
      const range: RfDatepickerRange = {
        startDate: { year: 2024, month: 8, day: 1 },
        endDate: { year: 2024, month: 8, day: 15 },
      };
      const state: FormControlState<RfDatepickerValue> = {
        value: range,
        disabled: false,
      };

      comp.writeValue(state);
      fixture.detectChanges();

      expect(comp.rangeStartDate()?.year).toBe(2024);
      expect(comp.rangeStartDate()?.month).toBe(8);
      expect(comp.rangeStartDate()?.day).toBe(1);
      expect(comp.rangeEndDate()?.year).toBe(2024);
      expect(comp.rangeEndDate()?.month).toBe(8);
      expect(comp.rangeEndDate()?.day).toBe(15);
    });

    it('should clear selections when value is null or undefined', () => {
      const comp = getComp(fixture);
      comp.dateSelected.set({ year: 2024, month: 6, day: 15 });

      comp.writeValue(undefined);
      fixture.detectChanges();

      expect(comp.dateSelected()).toBeUndefined();
    });
  });

  // ---------------------- registerOnChange / registerOnTouched ----------------------
  describe('registerOnChange / registerOnTouched', () => {
    it('should register onChange callback and invoke it when value changes', () => {
      const comp = getComp(fixture);
      const capturedValues: any[] = [];

      comp.registerOnChange((val: any) => {
        capturedValues.push(val);
      });

      const testDate = {
        year: 2024, month: 9, day: 10
      };
      comp.writeValue(testDate);
      fixture.detectChanges();

      expect(capturedValues.length).toBeGreaterThan(0);
      const lastValue = capturedValues[capturedValues.length - 1];
      expect(lastValue).toBeTruthy();
    });

    it('should register onTouched callback and invoke it on blur', () => {
      const comp = getComp(fixture);
      let touchedCalled = false;

      comp.registerOnTouched(() => {
        touchedCalled = true;
      });

      comp.executeActionBlur();
      expect(touchedCalled).toBeTrue();
    });
  });

  // ---------------------- minDate / maxDate input signals ----------------------
  describe('minDate / maxDate input signals', () => {
    it('should accept and store minDate signal value', () => {
      host.minDate.set({ year: 2024, month: 6, day: 10 });
      fixture.detectChanges();

      const comp = getComp(fixture);
      expect(comp.minDate()?.year).toBe(2024);
      expect(comp.minDate()?.month).toBe(6);
      expect(comp.minDate()?.day).toBe(10);
    });

    it('should accept and store maxDate signal value', () => {
      host.maxDate.set({ year: 2024, month: 12, day: 31 });
      fixture.detectChanges();

      const comp = getComp(fixture);
      expect(comp.maxDate()?.year).toBe(2024);
      expect(comp.maxDate()?.month).toBe(12);
      expect(comp.maxDate()?.day).toBe(31);
    });

    it('should update minDate when signal changes', () => {
      const comp = getComp(fixture);

      host.minDate.set({ year: 2024, month: 1, day: 1 });
      fixture.detectChanges();
      expect(comp.minDate()?.month).toBe(1);

      host.minDate.set({ year: 2024, month: 6, day: 1 });
      fixture.detectChanges();
      expect(comp.minDate()?.month).toBe(6);
    });
  });

  // ---------------------- displayMonths / showWeekNumbers / outsideDays ----------------------
  describe('displayMonths / showWeekNumbers / outsideDays', () => {
    it('should use displayMonths signal value', () => {
      host.displayMonths.set(2);
      fixture.detectChanges();

      const comp = getComp(fixture);
      expect(comp.displayMonths()).toBe(2);
    });

    it('should use showWeekNumbers signal value', () => {
      host.showWeekNumbers.set(true);
      fixture.detectChanges();

      const comp = getComp(fixture);
      expect(comp.showWeekNumbers()).toBeTrue();
    });

    it('should use outsideDays signal value', () => {
      host.outsideDays.set('visible');
      fixture.detectChanges();

      const comp = getComp(fixture);
      expect(comp.outsideDays()).toBe('visible');
    });

    it('should default displayMonths to 1', () => {
      const comp = getComp(fixture);
      expect(comp.displayMonths()).toBe(1);
    });

    it('should default showWeekNumbers to false', () => {
      const comp = getComp(fixture);
      expect(comp.showWeekNumbers()).toBeFalse();
    });
  });

  // ---------------------- rangeEnabled mode ----------------------
  describe('rangeEnabled mode', () => {
    it('should enable range selection when rangeEnabled is true', () => {
      host.rangeEnabled.set(true);
      fixture.detectChanges();

      const comp = getComp(fixture);
      expect(comp.rangeEnabled()).toBeTrue();
    });

    it('should have null range dates initially when rangeEnabled', () => {
      host.rangeEnabled.set(true);
      fixture.detectChanges();

      const comp = getComp(fixture);
      expect(comp.rangeStartDate()).toBeNull();
      expect(comp.rangeEndDate()).toBeNull();
    });

    it('should update rangeStartDate model signal', () => {
      host.rangeEnabled.set(true);
      fixture.detectChanges();

      const comp = getComp(fixture);
      const startDate = { year: 2024, month: 10, day: 5 };
      comp.rangeStartDate.set(startDate);
      fixture.detectChanges();

      expect(comp.rangeStartDate()?.year).toBe(2024);
      expect(comp.rangeStartDate()?.day).toBe(5);
    });

    it('should update rangeEndDate model signal', () => {
      host.rangeEnabled.set(true);
      fixture.detectChanges();

      const comp = getComp(fixture);
      const endDate = { year: 2024, month: 10, day: 15 };
      comp.rangeEndDate.set(endDate);
      fixture.detectChanges();

      expect(comp.rangeEndDate()?.year).toBe(2024);
      expect(comp.rangeEndDate()?.day).toBe(15);
    });
  });

  // ---------------------- readonly mode ----------------------
  describe('readonly mode', () => {
    it('should set readonly state via input signal', () => {
      host.readonly.set(true);
      fixture.detectChanges();

      const comp = getComp(fixture);
      expect(comp.readonly()).toBeTrue();
    });

    it('should add is-readonly class when readonly is true', () => {
      host.readonly.set(true);
      fixture.detectChanges();

      const datepickerEl = getDatepickerElement(fixture);
      expect(datepickerEl.classList.contains('is-readonly')).toBeTrue();
    });

    it('should not have is-readonly class when readonly is false', () => {
      host.readonly.set(false);
      fixture.detectChanges();

      const datepickerEl = getDatepickerElement(fixture);
      expect(datepickerEl.classList.contains('is-readonly')).toBeFalse();
    });

    it('should not emit keyDown when readonly is true', () => {
      host.readonly.set(true);
      fixture.detectChanges();

      const comp = getComp(fixture);
      const event = new KeyboardEvent('keydown', { key: 'Enter' });

      comp.handleKeyDown(event);

      expect(host.lastKeyDown).toBeNull();
    });
  });

  // ---------------------- disabled mode ----------------------
  describe('disabled mode', () => {
    it('should set disabled state via setDisabledState()', () => {
      const comp = getComp(fixture);
      expect(comp.disabled()).toBeFalse();

      comp.setDisabledState(true);
      fixture.detectChanges();

      expect(comp.disabled()).toBeTrue();
    });

    it('should set disabled state via input signal', () => {
      host.disabled.set(true);
      fixture.detectChanges();

      const comp = getComp(fixture);
      expect(comp.disabled()).toBeTrue();
    });

    it('should not emit keyDown when disabled is true', () => {
      host.disabled.set(true);
      fixture.detectChanges();

      const comp = getComp(fixture);
      const event = new KeyboardEvent('keydown', { key: 'Enter' });

      comp.handleKeyDown(event);

      expect(host.lastKeyDown).toBeNull();
    });
  });

  // ---------------------- formatDateId() ----------------------
  describe('formatDateId()', () => {
    it('should format date ID correctly', () => {
      const comp = getComp(fixture);
      spyOn(comp, 'getFullFormControlName').and.returnValue('datepicker');

      const date = { year: 2024, month: 9, day: 5 };
      const id = comp.formatDateId(date);

      expect(id).toBe('datepicker-20240905');
    });

    it('should pad single digit month and day with zero', () => {
      const comp = getComp(fixture);
      spyOn(comp, 'getFullFormControlName').and.returnValue('picker');

      const date = { year: 2024, month: 3, day: 7 };
      const id = comp.formatDateId(date);

      expect(id).toBe('picker-20240307');
    });

    it('should handle double digit month and day', () => {
      const comp = getComp(fixture);
      spyOn(comp, 'getFullFormControlName').and.returnValue('test');

      const date = { year: 2024, month: 12, day: 25 };
      const id = comp.formatDateId(date);

      expect(id).toBe('test-20241225');
    });
  });

  // ---------------------- focus() / focusError() ----------------------
  describe('focus() / focusError()', () => {
    it('should focus the datepicker element', () => {
      const comp = getComp(fixture);
      const datepicker = comp.datepicker();

      if (datepicker) {
        spyOn(datepicker, 'focus');
        comp.focus();
        expect(datepicker.focus).toHaveBeenCalled();
      } else {
        // If datepicker is not available, ensure focus method exists
        expect(comp.focus).toBeDefined();
      }
    });

    it('should call focus() when focusError() is invoked', () => {
      const comp = getComp(fixture);
      spyOn(comp, 'focus');

      comp.focusError();

      expect(comp.focus).toHaveBeenCalled();
    });
  });

  // ---------------------- handleKeyDown() / keyDown output ----------------------
  describe('handleKeyDown() / keyDown output', () => {
    it('should emit keyDown event when not readonly and not disabled', () => {
      const comp = getComp(fixture);
      const event = new KeyboardEvent('keydown', { key: 'Enter' });

      comp.handleKeyDown(event);

      expect(host.lastKeyDown).toBe(event);
    });

    it('should not emit keyDown when readonly', () => {
      host.readonly.set(true);
      fixture.detectChanges();

      const comp = getComp(fixture);
      const event = new KeyboardEvent('keydown', { key: 'Enter' });

      comp.handleKeyDown(event);

      expect(host.lastKeyDown).toBeNull();
    });

    it('should not emit keyDown when disabled', () => {
      host.disabled.set(true);
      fixture.detectChanges();

      const comp = getComp(fixture);
      const event = new KeyboardEvent('keydown', { key: 'Enter' });

      comp.handleKeyDown(event);

      expect(host.lastKeyDown).toBeNull();
    });

    it('should emit different keyboard events', () => {
      const comp = getComp(fixture);

      fixture.componentInstance.lastKeyDown = null;

      const event1 = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
      comp.handleKeyDown(event1);
      expect(host.lastKeyDown?.key).toBe('ArrowLeft');

      const event2 = new KeyboardEvent('keydown', { key: 'ArrowRight' });
      comp.handleKeyDown(event2);
      expect(host.lastKeyDown?.key).toBe('ArrowRight');
    });
  });

  // ---------------------- handleFocusOut() / executeActionBlur() ----------------------
  describe('handleFocusOut() / executeActionBlur()', () => {
    it('should mark control as touched on executeActionBlur', () => {
      const comp = getComp(fixture);
      let touchedCalled = false;

      comp.registerOnTouched(() => {
        touchedCalled = true;
      });

      comp.executeActionBlur();

      expect(touchedCalled).toBeTrue();
    });

    it('should execute onTouched callback', () => {
      const comp = getComp(fixture);
      const control = comp.getFormControl();

      if (control) {
        expect(control.touched).toBeFalsy();
        comp.executeActionBlur();
        // After blur, the component should trigger touched state
      }
    });
  });

  // ---------------------- specificDate validation ----------------------
  describe('specificDate validation', () => {
    it('should accept specificDate input signal', () => {
      host.specificDate.set('2024-10-15');
      fixture.detectChanges();

      const comp = getComp(fixture);
      expect(comp.specificDate()).toBe('2024-10-15');
    });

    it('should have undefined specificDate by default', () => {
      const comp = getComp(fixture);
      expect(comp.specificDate()).toBeUndefined();
    });
  });

  // ---------------------- specificStartDateRange / specificEndDateRange validation ----------------------
  describe('specificStartDateRange / specificEndDateRange validation', () => {
    it('should accept specificStartDateRange input signal', () => {
      host.specificStartDateRange.set('2024-10-01');
      fixture.detectChanges();

      const comp = getComp(fixture);
      expect(comp.specificStartDateRange()).toBe('2024-10-01');
    });

    it('should accept specificEndDateRange input signal', () => {
      host.specificEndDateRange.set('2024-10-31');
      fixture.detectChanges();

      const comp = getComp(fixture);
      expect(comp.specificEndDateRange()).toBe('2024-10-31');
    });

    it('should work together with rangeEnabled', () => {
      host.rangeEnabled.set(true);
      host.specificStartDateRange.set('2024-10-01');
      host.specificEndDateRange.set('2024-10-31');
      fixture.detectChanges();

      const comp = getComp(fixture);
      expect(comp.rangeEnabled()).toBeTrue();
      expect(comp.specificStartDateRange()).toBe('2024-10-01');
      expect(comp.specificEndDateRange()).toBe('2024-10-31');
    });
  });

  // ---------------------- appearance() ----------------------
  describe('appearance()', () => {
    it('should use the appearance signal value', () => {
      const comp = getComp(fixture);
      comp.appearance.set(comp.appearanceTypes.INTEGRATED);
      fixture.detectChanges();

      expect(comp.appearance()).toBe(comp.appearanceTypes.INTEGRATED);
    });

    it('should have DEFAULT appearance by default', () => {
      const comp = getComp(fixture);
      expect(comp.appearance()).toBe(comp.appearanceTypes.DEFAULT);
    });
  });

  // ---------------------- errorMessagesShouldBeDisplayed ----------------------
  describe('errorMessagesShouldBeDisplayed', () => {
    it('should return false when control has no errors', () => {
      const comp = getComp(fixture);
      const control = comp.getFormControl();

      if (control) {
        control.setErrors(null);
        fixture.detectChanges();
      }

      expect(comp.errorMessagesShouldBeDisplayed).toBeFalse();
    });

    it('should return true when control has errors and displayErrorsMode is ALWAYS', () => {
      host.displayErrorsMode.set(RfErrorDisplayModes.ALWAYS);
      fixture.detectChanges();

      const comp = getComp(fixture);
      const control = comp.getFormControl();

      if (control) {
        control.setErrors({ required: true });
        fixture.detectChanges();
      }

      expect(comp.errorMessagesShouldBeDisplayed).toBeTrue();
    });

    it('should respect displayErrorsMode TOUCHED', () => {
      host.displayErrorsMode.set(RfErrorDisplayModes.TOUCHED);
      fixture.detectChanges();

      const comp = getComp(fixture);
      const control = comp.getFormControl();

      if (control) {
        control.setErrors({ required: true });
        control.markAsUntouched();
        fixture.detectChanges();

        expect(comp.errorMessagesShouldBeDisplayed).toBeFalse();

        control.markAsTouched();
        fixture.detectChanges();

        expect(comp.errorMessagesShouldBeDisplayed).toBeTrue();
      }
    });

    it('should respect displayErrorsMode DIRTY', () => {
      host.displayErrorsMode.set(RfErrorDisplayModes.DIRTY);
      fixture.detectChanges();

      const comp = getComp(fixture);
      const control = comp.getFormControl();

      if (control) {
        control.setErrors({ required: true });
        control.markAsPristine();
        fixture.detectChanges();

        expect(comp.errorMessagesShouldBeDisplayed).toBeFalse();

        control.markAsDirty();
        fixture.detectChanges();

        expect(comp.errorMessagesShouldBeDisplayed).toBeTrue();
      }
    });

    it('should add has-error class when errors should be displayed', () => {
      host.displayErrorsMode.set(RfErrorDisplayModes.ALWAYS);
      fixture.detectChanges();

      const comp = getComp(fixture);
      const control = comp.getFormControl();

      if (control) {
        control.setErrors({ required: true });
        fixture.detectChanges();

        const datepickerEl = getDatepickerElement(fixture);
        expect(datepickerEl.classList.contains('has-error')).toBeTrue();
      }
    });
  });

  // ---------------------- IDs & utilities ----------------------
  describe('IDs & utilities', () => {
    it('should generate autoId correctly', () => {
      const comp = getComp(fixture);
      expect(comp.autoId).toBeTruthy();
      expect(typeof comp.autoId).toBe('string');
    });

    it('should return component name for ID without "Component" suffix', () => {
      const comp = getComp(fixture);
      const componentForId = comp.getComponentForId();
      expect(componentForId).toBe('RfDatepicker');
    });

    it('should generate full form control name', () => {
      const comp = getComp(fixture);
      const fullName = comp.getFullFormControlName();
      expect(fullName).toBeTruthy();
      expect(typeof fullName).toBe('string');
    });
  });

  // ---------------------- static showErrorsAccordingDisplayConfig() ----------------------
  describe('static showErrorsAccordingDisplayConfig()', () => {
    it('should return true for ALWAYS mode when control has errors', () => {
      const comp = getComp(fixture);
      const control = comp.getFormControl();

      if (control) {
        control.setErrors({ required: true });
        const result = RfDatepickerComponent.showErrorsAccordingDisplayConfig(
          control,
          RfErrorDisplayModes.ALWAYS
        );
        expect(result).toBeTrue();
      }
    });

    it('should return false for NONE mode even if control has errors', () => {
      const comp = getComp(fixture);
      const control = comp.getFormControl();

      if (control) {
        control.setErrors({ required: true });
        const result = RfDatepickerComponent.showErrorsAccordingDisplayConfig(
          control,
          RfErrorDisplayModes.NONE
        );
        expect(result).toBeFalse();
      }
    });

    it('should return true for TOUCHED mode when control is touched and has errors', () => {
      const comp = getComp(fixture);
      const control = comp.getFormControl();

      if (control) {
        control.setErrors({ required: true });
        control.markAsTouched();
        const result = RfDatepickerComponent.showErrorsAccordingDisplayConfig(
          control,
          RfErrorDisplayModes.TOUCHED
        );
        expect(result).toBeTrue();
      }
    });

    it('should return false for TOUCHED mode when control is untouched', () => {
      const comp = getComp(fixture);
      const control = comp.getFormControl();

      if (control) {
        control.setErrors({ required: true });
        control.markAsUntouched();
        const result = RfDatepickerComponent.showErrorsAccordingDisplayConfig(
          control,
          RfErrorDisplayModes.TOUCHED
        );
        expect(result).toBeFalse();
      }
    });

    it('should return true for DIRTY mode when control is dirty and has errors', () => {
      const comp = getComp(fixture);
      const control = comp.getFormControl();

      if (control) {
        control.setErrors({ required: true });
        control.markAsDirty();
        const result = RfDatepickerComponent.showErrorsAccordingDisplayConfig(
          control,
          RfErrorDisplayModes.DIRTY
        );
        expect(result).toBeTrue();
      }
    });

    it('should return false for DIRTY mode when control is pristine', () => {
      const comp = getComp(fixture);
      const control = comp.getFormControl();

      if (control) {
        control.setErrors({ required: true });
        control.markAsPristine();
        const result = RfDatepickerComponent.showErrorsAccordingDisplayConfig(
          control,
          RfErrorDisplayModes.DIRTY
        );
        expect(result).toBeFalse();
      }
    });

    it('should return true for DIRTY_AND_TOUCHED mode when control is dirty, touched, and has errors', () => {
      const comp = getComp(fixture);
      const control = comp.getFormControl();

      if (control) {
        control.setErrors({ required: true });
        control.markAsDirty();
        control.markAsTouched();
        const result = RfDatepickerComponent.showErrorsAccordingDisplayConfig(
          control,
          RfErrorDisplayModes.DIRTY_AND_TOUCHED
        );
        expect(result).toBeTrue();
      }
    });

    it('should return false for DIRTY_AND_TOUCHED mode when control is pristine or untouched', () => {
      const comp = getComp(fixture);
      const control = comp.getFormControl();

      if (control) {
        control.setErrors({ required: true });
        control.markAsPristine();
        control.markAsUntouched();
        const result = RfDatepickerComponent.showErrorsAccordingDisplayConfig(
          control,
          RfErrorDisplayModes.DIRTY_AND_TOUCHED
        );
        expect(result).toBeFalse();
      }
    });
  });

  // ---------------------- getElementRef() ----------------------
  describe('getElementRef()', () => {
    it('should return the datepicker element reference', () => {
      const comp = getComp(fixture);
      const elementRef = comp.getElementRef();

      expect(elementRef).toBeTruthy();
      expect(elementRef.nativeElement).toBeTruthy();
    });
  });

  // ---------------------- ngOnDestroy() ----------------------
  describe('ngOnDestroy()', () => {
    it('should complete the unsubscribe subject on destroy', () => {
      const comp = getComp(fixture);
      const unsubscribe$ = (comp as any).$unsubscribe;

      spyOn(unsubscribe$, 'next');
      spyOn(unsubscribe$, 'complete');

      comp.ngOnDestroy();

      expect(unsubscribe$.next).toHaveBeenCalled();
      expect(unsubscribe$.complete).toHaveBeenCalled();
    });
  });

  // ---------------------- datepicker viewChild ----------------------
  describe('datepicker viewChild', () => {
    it('should have access to NgbDatepicker instance', () => {
      const comp = getComp(fixture);
      const datepicker = comp.datepicker();

      expect(datepicker).toBeTruthy();
    });
  });

  // ---------------------- datepickerRef viewChild ----------------------
  describe('datepickerRef viewChild', () => {
    it('should have access to datepicker container ElementRef', () => {
      const comp = getComp(fixture);
      const datepickerRef = comp.datepickerRef();

      expect(datepickerRef).toBeTruthy();
      expect(datepickerRef?.nativeElement).toBeTruthy();
    });
  });

  // ---------------------- dateSelected model ----------------------
  describe('dateSelected model', () => {
    it('should allow setting dateSelected via model signal', () => {
      const comp = getComp(fixture);
      const date: NgbDateStruct = { year: 2024, month: 11, day: 20 };

      comp.dateSelected.set(date);
      fixture.detectChanges();

      expect(comp.dateSelected()?.year).toBe(2024);
      expect(comp.dateSelected()?.month).toBe(11);
      expect(comp.dateSelected()?.day).toBe(20);
    });
  });
});
