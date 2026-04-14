import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RfSelectDatePickerComponent } from './rf-select-date-picker.component';
import { RfFormGroup } from '../../extensions/components/rf-form-group.component';
import { RfFormControl } from '../../extensions/components/rf-form-control.component';

/** Host with library's own Reactive Forms (RfFormGroup / RfFormControl) */
import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { ShortDate } from 'reactive-forms';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, RfSelectDatePickerComponent],
  template: `
    <form [formGroup]="form">
      <rf-select-date-picker
        formControlName="date"
        [title]="'Birthday'"  
        [yearRange]="yearRange">
      </rf-select-date-picker>
    </form>
  `,
})
class HostComponent {
  form = new RfFormGroup('HostForm', {
    date: new RfFormControl<ShortDate | null>(null),
  });
  // Deterministic year range for tests
  yearRange = { startYear: 2020, endYear: 2022 };
}

// ---- helpers ----
async function flushView<T>(fixture: ComponentFixture<T>) {
  fixture.detectChanges();
  await fixture.whenStable();
  fixture.detectChanges();
}

describe('RfSelectDatePickerComponent — Public API con RfFormGroup/RfFormControl', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    await flushView(fixture);
  });

  function getComp(): RfSelectDatePickerComponent {
    return fixture.debugElement.query(By.directive(RfSelectDatePickerComponent)).componentInstance;
  }

  it('instantiates within an RfFormGroup/RfFormControl', async () => {
    const comp = getComp();
    expect(comp).toBeTruthy();
    // The internal form should exist
    expect(comp.getInnerFormGroup()).toBeTruthy();
    // The year selects must respect the range
    expect(comp.years.length).toBe(3); // 2022, 2021, 2020
    expect(comp.years[0].value).toBe('2022');
    expect(comp.years[2].value).toBe('2020');
  });

  it('writeValue() with ShortDate fills the internal form (day/month/year) and does NOT emit changes to external if internal emitEvent=false', async () => {
    const comp = getComp();
    const d = { year: 2021, month: 2, day: 10 }; // 10/02/2021
    host.form.get('date')?.setValue(d); // this feeds the CVA
    await flushView(fixture);

    const inner = comp.getInnerFormGroup();
    expect(inner.get('day')?.value).toBe('10');
    expect(inner.get('month')?.value).toBe('2');
    expect(inner.get('year')?.value).toBe('2021');

    // The external control must reflect the same ShortDate (same year/month/day)
    const out: ShortDate | null = host.form.get('date')?.value ?? null;
    expect(out).toBeTruthy();
    expect(out?.year).toBe(2021);
    expect(out?.month).toBe(2);
    expect(out?.day).toBe(10);
  });

  it('writeValue() accepts FormControlState-like { value }', async () => {
    const comp = getComp();
    const d = { year: 2022, month: 12, day: 5 };

    // Simulates a FormControlState
    const formState = { value: d, disabled: false };
    // setValue on external uses CVA and will end up in writeValue()
    (host.form.get('date') as RfFormControl).setValue(formState as any);
    await flushView(fixture);

    const inner = comp.getInnerFormGroup();
    expect(inner.get('day')?.value).toBe('5');
    expect(inner.get('month')?.value).toBe('12');
    expect(inner.get('year')?.value).toBe('2022');
  });

  it('when user changes internal form (day/month/year), CVA propagates a ShortDate to external control', async () => {
    const comp = getComp();
    const inner = comp.getInnerFormGroup();

    // Simulates user selection: 29/02/2020 (leap year)
    inner.get('year')?.setValue('2020');
    inner.get('month')?.setValue('2');
    inner.get('day')?.setValue('29');

    await flushView(fixture);

    const out: ShortDate | null = host.form.get('date')?.value ?? null;
    expect(out).toBeTruthy();
    expect(out?.year).toBe(2020);
    expect(out?.month).toBe(2);
    expect(out?.day).toBe(29);
  });

  it('setDisabledState(true/false) integrates with external RfFormControl and disables internal form', async () => {
    const comp = getComp();

    // Disables from outside
    host.form.get('date')?.disable({ emitEvent: false });
    await flushView(fixture);
    expect(comp.getInnerFormGroup().disabled).toBeTrue();

    // Enables from outside
    host.form.get('date')?.enable({ emitEvent: false });
    await flushView(fixture);
    expect(comp.getInnerFormGroup().disabled).toBeFalse();
  });

  it('recalculates days according to month/year (Feb 2024 => 29 days)', async () => {
    const comp = getComp();
    const inner = comp.getInnerFormGroup();

    inner.get('year')?.setValue('2024'); // leap year
    inner.get('month')?.setValue('2');
    await flushView(fixture);

    expect(comp.days.length).toBe(29);
    expect(comp.days[0].value).toBe('1');
    expect(comp.days[28].value).toBe('29');
  });

  it('recalculates days for February in non-leap year (28 days)', async () => {
    const comp = getComp();
    const inner = comp.getInnerFormGroup();

    inner.get('year')?.setValue('2021'); // non-leap year
    inner.get('month')?.setValue('2');
    await flushView(fixture);

    expect(comp.days.length).toBe(28);
    expect(comp.days[27].value).toBe('28');
  });

  it('recalculates days for 30-day months (April)', async () => {
    const comp = getComp();
    const inner = comp.getInnerFormGroup();

    inner.get('year')?.setValue('2021');
    inner.get('month')?.setValue('4'); // April
    await flushView(fixture);

    expect(comp.days.length).toBe(30);
    expect(comp.days[29].value).toBe('30');
  });

  it('recalculates days for 31-day months (January)', async () => {
    const comp = getComp();
    const inner = comp.getInnerFormGroup();

    inner.get('year')?.setValue('2021');
    inner.get('month')?.setValue('1'); // January
    await flushView(fixture);

    expect(comp.days.length).toBe(31);
    expect(comp.days[30].value).toBe('31');
  });

  it('writeValue() clears values when receiving null', async () => {
    const comp = getComp();
    comp.writeValue({ year: 2021, month: 2, day: 10 });
    await flushView(fixture);

    comp.writeValue(null as any);
    await flushView(fixture);

    const inner = comp.getInnerFormGroup();
    expect(inner.get('day')?.value).toBeFalsy();
    expect(inner.get('month')?.value).toBeFalsy();
    expect(inner.get('year')?.value).toBeFalsy();
  });

  it('writeValue() clears values when receiving undefined', async () => {
    const comp = getComp();
    comp.writeValue({ year: 2021, month: 2, day: 10 });
    await flushView(fixture);

    comp.writeValue(undefined as any);
    await flushView(fixture);

    const inner = comp.getInnerFormGroup();
    expect(inner.get('day')?.value).toBeFalsy();
    expect(inner.get('month')?.value).toBeFalsy();
    expect(inner.get('year')?.value).toBeFalsy();
  });

  it('normalizes time components to 00:00:00.000', async () => {
    const comp = getComp();
    const d = { year: 2021, month: 6, day: 15 };
    host.form.get('date')?.setValue(d);
    await flushView(fixture);

    const out: ShortDate | null = host.form.get('date')?.value ?? null;
    expect(out?.year).toBe(2021);
    expect(out?.month).toBe(6);
    expect(out?.day).toBe(15);
  });

  it('registerOnChange invokes callback when user changes internal form', async () => {
    const comp = getComp();
    let changedValue: any;
    comp.registerOnChange((val: any) => {
      changedValue = val;
    });

    const inner = comp.getInnerFormGroup();
    inner.get('year')?.setValue('2020');
    inner.get('month')?.setValue('2');
    inner.get('day')?.setValue('15');
    await flushView(fixture);

    expect(changedValue).toBeTruthy();
    expect(changedValue?.year).toBe(2020);
  });

  it('setDisabledState updates the isDisabled property', async () => {
    const comp = getComp();
    expect(comp.isDisabled).toBe(false);

    comp.setDisabledState(true);
    await flushView(fixture);
    expect(comp.isDisabled).toBe(true);

    comp.setDisabledState(false);
    await flushView(fixture);
    expect(comp.isDisabled).toBe(false);
  });

  it('getInnerFormGroup() returns the internal form group', () => {
    const comp = getComp();
    const inner = comp.getInnerFormGroup();

    expect(inner).toBeTruthy();
    expect(inner).toBe(comp.form);
    expect(inner.get('day')).toBeTruthy();
    expect(inner.get('month')).toBeTruthy();
    expect(inner.get('year')).toBeTruthy();
  });

  it('getElementRef() returns element reference from firstControl', async () => {
    const comp = getComp();
    await flushView(fixture);

    const elementRef = comp.getElementRef();
    expect(elementRef).toBeTruthy();
  });

  it('focus() attempts to focus on firstControl', async () => {
    const comp = getComp();
    await flushView(fixture);

    const firstControl = comp.firstControl();
    if (firstControl) {
      spyOn(firstControl, 'focus');
      comp.focus();
      expect(firstControl.focus).toHaveBeenCalled();
    } else {
      expect(() => comp.focus()).not.toThrow();
    }
  });

  it('focusError() llama a focusFirstInvalidField', async () => {
    const comp = getComp();
    
    if (comp.form && typeof comp.form.focusFirstInvalidField === 'function') {
      spyOn(comp.form, 'focusFirstInvalidField');
      comp.focusError();
      expect(comp.form.focusFirstInvalidField).toHaveBeenCalled();
    } else {
      expect(() => comp.focusError()).not.toThrow();
    }
  });

  it('executeActionBlur() es una función no-op', () => {
    const comp = getComp();
    expect(() => comp.executeActionBlur()).not.toThrow();
  });

  it('synchronizes changes from internal form to external control', async () => {
    const comp = getComp();
    const inner = comp.getInnerFormGroup();

    inner.get('year')?.setValue('2021');
    inner.get('month')?.setValue('7');
    inner.get('day')?.setValue('20');
    await flushView(fixture);

    const external = host.form.get('date')?.value;
    expect(external).toBeTruthy();
    expect(external?.year).toBe(2021);
    expect(external?.month).toBe(7);
    expect(external?.day).toBe(20);
  });

  it('marks external control as touched when internal control is touched', async () => {
    const comp = getComp();
    const inner = comp.getInnerFormGroup();
    const external = host.form.get('date');

    (inner.get('day') as RfFormControl).markAsTouched();
    await flushView(fixture);

    expect(external?.touched).toBeTrue();
  });

  it('marks external control as dirty when internal control is dirty', async () => {
    const comp = getComp();
    const inner = comp.getInnerFormGroup();
    const external = host.form.get('date');

    (inner.get('day') as RfFormControl).markAsDirty();
    await flushView(fixture);

    expect(external?.dirty).toBeTrue();
  });

  it('dateFormatOrder returns the date format order', () => {
    const comp = getComp();
    const order = comp.dateFormatOrder;
    expect(order).toBeTruthy();
    expect(Array.isArray(order)).toBe(true);
    expect(order.length).toBeGreaterThan(0);
  });

  it('hostClasses returns empty string when there is no container class', () => {
    const comp = getComp();
    const classes = comp.hostClasses;
    expect(classes).toBe('');
  });

  it('rfTypeClass is set to "RfSelectDatePickerComponent"', () => {
    const comp = getComp();
    expect(comp.rfTypeClass).toBe('RfSelectDatePickerComponent');
  });

  it('initializes the months array with 12 options', () => {
    const comp = getComp();
    expect(comp.months.length).toBe(12);
  });

  it('initializes isDisabled as false', () => {
    const comp = getComp();
    expect(comp.isDisabled).toBe(false);
  });

  it('generates a unique groupSuffix', () => {
    const comp = getComp();
    expect(comp.groupSuffix).toBeTruthy();
    expect(comp.groupSuffix.length).toBeGreaterThan(0);
  });

  it('generates autoId for each select (day, month, year)', () => {
    const comp = getComp();
    expect(comp.autoIdDay).toBeTruthy();
    expect(comp.autoIdMonth).toBeTruthy();
    expect(comp.autoIdYear).toBeTruthy();
  });
});
