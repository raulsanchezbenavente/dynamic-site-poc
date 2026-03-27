import { NgClass } from '@angular/common';
import {
  AfterContentInit,
  Component,
  ElementRef,
  forwardRef,
  HostBinding,
  input,
  model,
  OnDestroy,
  OnInit,
  viewChild,
} from '@angular/core';
import {
  AbstractControl,
  FormControlState,
  FormsModule,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';
import dayjs, { Dayjs } from 'dayjs';
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);

import { SafeHtml } from '@angular/platform-browser';
import { noop } from 'rxjs';

import { RfBaseReactiveComponent } from '../../abstract/components/rf-base-reactive.component';
import { RfErrorDisplayModes } from '../../abstract/enums/rf-base-reactive-display-mode.enum';
import { RfFormControl } from '../../extensions/components/rf-form-control.component';
import { RfFormGroup } from '../../extensions/components/rf-form-group.component';
import { RfDebugStateComponent } from '../common/rf-debug-state/rf-debug-state.component';
import { RfErrorMessagesComponent } from '../common/rf-error-messages/rf-error-messages.component';
import { RfHintMessagesComponent } from '../common/rf-hint-messages/rf-hint-messages.component';
import { RfListOption } from '../rf-list/models/rf-list-option.model';
import { RfSelectComponent } from '../rf-select/rf-select.component';

import { RfSelectDatePickerAria } from './models/rf-select-date-picker-aria.model';
import { RfSelectDatePickerClases } from './models/rf-select-date-picker-classes.model';
import { RfSelectDatePickerErrorMessages } from './models/rf-select-date-picker-error-messages.model';
import { RfSelectDatePickerForm } from './models/rf-select-date-picker-form.model';
import { RfSelectDatePickerHintMessages } from './models/rf-select-date-picker-hint-messages.model';
import { RfSelectDatePickerOptionsData } from './models/rf-select-date-picker-months.model';
import { RfSelectDatePickerValidators } from './models/rf-select-date-picker-validators.model';
import { MonthAbbreviationConfig } from './types/rf-select-date-picker-abbreviation.type';

/**
 * `RfSelectDatePickerComponent` is a composite date selector that allows users to select a full date (day, month, year)
 * using three dropdowns (`rf-select` components). It integrates with Angular Reactive Forms
 * and supports localization, custom validators, and form control synchronization.
 *
 * This component extends `RfBaseReactiveComponent`, enabling integration with a shared reactive form architecture.
 * It uses `dayjs` for date manipulation and formatting.
 *
 * Month names follow the active locale. The selected month may be abbreviated to avoid truncation or ellipsis.
 * Doc reference: Select Date Picker – Month format & abbreviation (Confluences) -
 * https://flyr.atlassian.net/wiki/spaces/DC/pages/6091964496/Select+Date+Picker+-+Month+format+abbreviation
 *
 * Selector: `rf-select-date-picker`
 *
 * Example use cases:
 * - Birthdate selection
 * - Non-calendar-based date input
 * - Mobile-friendly date selection UI
 */
@Component({
  selector: 'rf-select-date-picker',
  standalone: true,
  templateUrl: './rf-select-date-picker.component.html',
  styleUrls: ['./styles/rf-select-date-picker.styles.scss'],
  host: { class: 'rf-select-date-picker' },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RfSelectDatePickerComponent),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => RfSelectDatePickerComponent),
      multi: true,
    },
  ],
  imports: [
    NgClass,
    ReactiveFormsModule,
    FormsModule,
    RfSelectComponent,
    RfErrorMessagesComponent,
    RfHintMessagesComponent,
    RfDebugStateComponent,
  ],
})
export class RfSelectDatePickerComponent
  extends RfBaseReactiveComponent<
    Dayjs | FormControlState<Dayjs> | null,
    RfSelectDatePickerHintMessages,
    RfSelectDatePickerErrorMessages,
    RfSelectDatePickerClases,
    RfSelectDatePickerAria
  >
  implements OnInit, AfterContentInit, OnDestroy
{
  /** Reference to the first select */
  public readonly firstControl = viewChild<RfSelectComponent>('firstControl');

  /** Reference to the fieldset element for width observation */
  public readonly fieldsetElement = viewChild<ElementRef<HTMLFieldSetElement>>('fieldsetElement');

  /** Title displayed above the component. Optional. */
  public title = input<string>('');

  /** Labels and display options for the select components (e.g., months in different languages). */
  public selectsLabels = input<RfSelectDatePickerOptionsData>();

  /** Whether to display validation errors for day, month, and year separately. */
  public separatedErrors = input<boolean>(false);

  /** Internal form group containing day, month, and year fields. */
  public form!: RfFormGroup;

  /** Whether the component is currently disabled. */
  public isDisabled = false;

  /** Unique suffix used to distinguish internal form group instances. */
  public groupSuffix: string = this.idService.generateRandomId();

  /** Combined ARIA error message ID for accessibility purposes. */
  public ariaIdCombined: string = '';

  /** Type identifier used for debugging and styling purposes. */
  public override rfTypeClass: string = 'RfSelectDatePickerComponent';

  /** List of options for the "day" select, updated dynamically. */
  public days: RfListOption[] = [];

  /** Optional object to define the year range shown in the year selector. */
  public yearRange = input<{ startYear: number; endYear: number } | null>(null);

  /** List of options for the "year" select, descending from current year back 100 years, or customized from yearRange */
  public years: RfListOption[] = [];

  /** Id for select day */
  public autoIdDay: string = '';

  /** Id for select month */
  public autoIdMonth: string = '';

  /** Id for select year */
  public autoIdYear: string = '';

  /** ResizeObserver instance for tracking component width */
  private resizeObserver?: ResizeObserver;

  /** Month abbreviation config. Behaviour and threshold data for month abbreviation */
  public abbreviationMonth = model<MonthAbbreviationConfig | undefined>(undefined);
  public abbreviationMonthsApplied: ((data: SafeHtml) => SafeHtml) | undefined = undefined;

  /** List of options for the "month" select, initialized with localized month names. */
  public months: RfListOption[] = Array.from({ length: 12 }, (_, i) => ({
    value: (i + 1).toString(),
    content: dayjs().month(i).format('MMMM'),
  }));

  /**
   * Determines whether a combined field group (e.g. date picker, phone prefix + number)
   * should display the `group-has-error` state.
   *
   * Rules:
   * - If `displayErrorsMode` is set to ALWAYS → show the error state whenever the group is invalid.
   * - Otherwise → show the error state only when at least one control in the group
   *   has been touched (blurred) and the group is invalid.
   *
   * This prevents showing an error state prematurely when the user is still interacting
   * with the fields (e.g. opening a dropdown or focusing an input) but hasn't left the group.
   */
  get hasGroupError(): boolean {
    if (!this.form) return false;

    const mode = this.displayErrorsMode();

    if (mode === RfErrorDisplayModes.ALWAYS) {
      return this.form.invalid;
    }
    const anyTouched = Object.values(this.form.controls).some((c) => c?.touched);
    return this.form.invalid && anyTouched;
  }

  /**
   * Returns the order of date components (e.g., ['DD', 'MM', 'YYYY']) based on locale or culture settings.
   * Used for rendering the select fields in the correct order.
   */
  get dateFormatOrder(): string[] {
    const format = this.culture()?.shortDateFormat ?? 'DD-MM-YYYY';
    return format.toUpperCase().split(/[-./*\s]+/);
  }

  /**
   * Dynamically applies CSS classes from the `classes()` input to the host element.
   * Defaults to `''` if no container class is provided.
   */
  @HostBinding('class') get hostClasses(): string {
    return this.classes()?.container ?? '';
  }

  /**
   * Angular lifecycle hook called on component initialization.
   * Sets up the internal form, initializes day/month/year values,
   * and handles value propagation and validation.
   */
  public ngOnInit(): void {
    this.updateMonths();
    this.updateYears();

    const actualValue = this.value() as Dayjs | undefined;

    const day: string = dayjs.isDayjs(actualValue) ? actualValue.date().toString() : '';
    const month: string = dayjs.isDayjs(actualValue) ? (actualValue.month() + 1).toString() : '';
    const year: string = dayjs.isDayjs(actualValue) ? actualValue.year().toString() : '';

    this.form = new RfFormGroup('formGroupDatePicker' + this.groupSuffix, {
      day: new RfFormControl({ value: day, disabled: this.isDisabled }),
      month: new RfFormControl({ value: month, disabled: this.isDisabled }),
      year: new RfFormControl({ value: year, disabled: this.isDisabled }),
    });

    this.form.valueChanges.subscribe((value: RfSelectDatePickerForm) => {
      if (value.day && value.month && value.year) {
        const date: Dayjs = dayjs()
          .utc()
          .year(+value.year)
          .month(+value.month - 1)
          .date(+value.day)
          .hour(0)
          .minute(0)
          .second(0)
          .millisecond(0);
        this.value.set(date);
        this.onChange(date);
        if (!this.formControlName()) {
          this.control?.setValue(date);
        }
      } else {
        this.value.set(undefined);
        this.onChange(null);
      }
      if (this.form?.valid) {
        this.control?.setErrors(null);
      } else {
        this.control?.setErrors(this.getAllFormErrors(this.form));
      }
    });

    this.form.get('month')?.valueChanges.subscribe(() => {
      this.recalculateDays('month');
      this.form.get('day')?.updateValueAndValidity({ onlySelf: true, emitEvent: false });
      this.form.get('year')?.updateValueAndValidity({ onlySelf: true, emitEvent: false });
    });

    this.form.get('year')?.valueChanges.subscribe(() => {
      this.recalculateDays('year');
      this.form.get('day')?.updateValueAndValidity({ onlySelf: true, emitEvent: false });
      this.form.get('month')?.updateValueAndValidity({ onlySelf: true, emitEvent: false });
    });

    this.form.get('day')?.valueChanges.subscribe(() => {
      this.form.get('month')?.updateValueAndValidity({ onlySelf: true, emitEvent: false });
      this.form.get('year')?.updateValueAndValidity({ onlySelf: true, emitEvent: false });
    });

    this.form.get('day')?.updateValueAndValidity();

    this.form.get('day')?.statusChanges.subscribe((status) => {
      if (status === 'VALID') {
        this.refreshDaysAfterDayBecomesValid();
      }
    });
    (this.form.get('day') as RfFormControl).onMarkAsTouched.subscribe(() => {
      this.control?.markAsTouched();
    });
    (this.form.get('month') as RfFormControl).onMarkAsTouched.subscribe(() => {
      this.control?.markAsTouched();
    });
    (this.form.get('year') as RfFormControl).onMarkAsTouched.subscribe(() => {
      this.control?.markAsTouched();
    });
    (this.form.get('day') as RfFormControl).onMarkAsDirty.subscribe(() => {
      this.control?.markAsDirty();
    });
    (this.form.get('month') as RfFormControl).onMarkAsDirty.subscribe(() => {
      this.control?.markAsDirty();
    });
    (this.form.get('year') as RfFormControl).onMarkAsDirty.subscribe(() => {
      this.control?.markAsDirty();
    });

    const fieldset = this.fieldsetElement()?.nativeElement;
    if (this.abbreviationMonth() && fieldset) {
      this.resizeObserver = new ResizeObserver(() => {
        this.abbreviationMonthsApplied =
          fieldset.offsetWidth < this.abbreviationMonth()!.threshold ? this.abbreviationMonth()!.mask : undefined;
        this.changeDetector.markForCheck();
      });
      this.resizeObserver.observe(fieldset);
    }
  }

  public override getElementRef(): ElementRef {
    return this.firstControl()!.getElementRef();
  }

  /**
   * Returns the internal form group used by the component.
   * Useful for external diagnostics or control access.
   *
   * @returns The internal RfFormGroup instance.
   */
  public getInnerFormGroup(): RfFormGroup {
    return this.form;
  }

  /**
   * Adds a validator to the internal day, month and year controls
   * and re-evaluates their validity.
   */
  public addFieldValidators(validator: ValidatorFn): void {
    this.form.get('day')?.addValidators(validator);
    this.form.get('month')?.addValidators(validator);
    this.form.get('year')?.addValidators(validator);
    this.revalidateFields();
  }

  /**
   * Re-runs validators on the internal day, month and year controls.
   * Useful when validators are added dynamically after initialisation
   * and the sub-controls need to re-evaluate their validity.
   */
  public revalidateFields(): void {
    this.form.get('day')?.updateValueAndValidity({ emitEvent: false });
    this.form.get('month')?.updateValueAndValidity({ emitEvent: false });
    this.form.get('year')?.updateValueAndValidity({ emitEvent: false });
  }

  /**
   * Angular lifecycle hook called after content projection is initialized.
   * Used to synchronize values and states when the component is used standalone.
   */
  public override ngAfterContentInit(): void {
    super.ngAfterContentInit();
    if (!this.formControlName()) {
      if (this.value()) {
        this.control?.setValue(this.value() as Dayjs, { emitEvent: false });
      }
      this.disabled() ? this.form?.disable() : this.form?.enable();
      this.disabled() ? this.control?.disable() : this.control?.enable();
    }
    const validators = (
      this.getFormControl() as RfFormControl
    )?.getCustomValidators() as unknown as RfSelectDatePickerValidators;
    if (validators?.day) {
      this.form.get('day')?.addValidators(validators.day);
    }
    if (validators?.month) {
      this.form.get('month')?.addValidators(validators.month);
    }
    if (validators?.year) {
      this.form.get('year')?.addValidators(validators.year);
    }

    this.form.get('day')?.updateValueAndValidity();
    this.form.get('month')?.updateValueAndValidity();
    this.form.get('year')?.updateValueAndValidity();

    this.applyValidatorToInnerList('day', validators.day);
    this.applyValidatorToInnerList('month', validators.month);
    this.applyValidatorToInnerList('year', validators.year);

    if (!this.formControlName()) {
      this.onChangeDisabledState.subscribe((isDisabled: boolean) => {
        isDisabled ? this.control?.disable() : this.control?.enable();
        isDisabled ? this.form?.disable() : this.form?.enable();
      });
      this.control?.statusChanges.subscribe(() => {
        this.control?.enabled ? this.form?.enable({ emitEvent: false }) : this.form?.disable({ emitEvent: false });
      });
    }

    this.registerStateFormEvents(this.getFormControl() as RfFormControl, this.form);

    this.control?.markAsUntouched();
    this.control?.markAsPristine();

    this.ariaIdCombined = this.randomId;

    this.autoIdDay = this.getCustomAutoId();
    this.autoIdMonth = this.getCustomAutoId();
    this.autoIdYear = this.getCustomAutoId();

    (this.form.get('day') as RfFormControl).isRequired = this.isRequired;
    (this.form.get('month') as RfFormControl).isRequired = this.isRequired;
    (this.form.get('year') as RfFormControl).isRequired = this.isRequired;
  }

  public ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
  }

  /**
   * Called by Angular to write a value into the component.
   * Parses a Dayjs object (or FormControlState<Dayjs>) and sets day/month/year fields.
   *
   * @param value - The value to write, which can be Dayjs or FormControlState<Dayjs>.
   */
  public override writeValue(value: Dayjs | FormControlState<Dayjs>): void {
    const provisionalValue = this.isFormControlState(value) ? value.value : value;
    if (dayjs.isDayjs(provisionalValue) && !Number.isNaN(provisionalValue.valueOf())) {
      const actualValue = provisionalValue.hour(0).minute(0).second(0).millisecond(0);
      this.onChange(actualValue);
      this.form.setValue(
        {
          day: actualValue.utc().date().toString(),
          month: (actualValue.utc().month() + 1).toString(),
          year: actualValue.utc().year().toString(),
        },
        { emitEvent: false }
      );
      this.updateDays();
    } else {
      this.form.patchValue(
        {
          day: undefined,
          month: undefined,
          year: undefined,
        },
        { emitEvent: false }
      );
    }
    this.updateDisabledState();
  }

  /**
   * Called by Angular forms to disable or enable the component.
   * Applies the disabled state to all inner controls.
   *
   * @param isDisabled - Whether the component should be disabled.
   */
  public override setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
    this.updateDisabledState();
  }

  /**
   * Called by Angular forms to validate the internal form.
   * Returns a ValidationErrors object if any control is invalid.
   *
   * @param control - Optional AbstractControl instance.
   * @returns A ValidationErrors object or null if valid.
   */
  public override validate(control?: AbstractControl): ValidationErrors | null {
    if (this.form.valid) {
      return null;
    }
    const errors: ValidationErrors = {};
    for (const key of Object.keys(this.form.controls)) {
      const controlErrors = this.form.get(key)?.errors;
      if (controlErrors) {
        errors[key] = controlErrors;
      }
    }
    return errors;
  }

  /**
   * Creates the internal standalone form control if the component is used
   * outside a form group. Applies initial value and validators.
   */
  protected override standaloneControlCreation(): void {
    this.control ??= new RfFormControl(this.value() as Dayjs, this.validators() as RfSelectDatePickerValidators);
  }

  /**
   * Applies a validator or array of validators to the inner 'list' control
   * inside the given RfSelectComponent for a specific field (day, month, or year).
   *
   * @param controlName - The name of the control ('day', 'month', or 'year').
   * @param validator - The validator(s) to apply.
   */
  private applyValidatorToInnerList(controlName: string, validator?: ValidatorFn | ValidatorFn[]): void {
    const control = this.form.get(controlName) as RfFormControl | null;
    const rfComponent = control?.rfComponent as RfSelectComponent | undefined;
    const innerForm = rfComponent?.form;
    const listControl = innerForm?.get('list');

    if (validator) {
      listControl?.addValidators(validator);
    }
    listControl?.updateValueAndValidity();
  }

  /**
   * Recalculates the number of days in the selected month and year,
   * and updates the `days` list accordingly.
   *
   * @param origin - Indicates whether the update was triggered by month or year change.
   */
  private recalculateDays(origin: 'month' | 'year'): void {
    const year = +this.form.get('year')?.value;
    const month = +this.form.get('month')?.value;
    const currentDay = +this.form.get('day')?.value;

    if (!month) {
      this.days = Array.from({ length: 31 }, (_, i) => ({
        value: (i + 1).toString(),
        content: (i + 1).toString(),
      }));
      return;
    }

    const shouldRecalculate = origin === 'month' || (origin === 'year' && month === 2);

    if (!shouldRecalculate) return;

    const daysInMonth = this.getDaysInMonth(month, year);

    if (currentDay && currentDay > daysInMonth) {
      return;
    }

    this.days = Array.from({ length: daysInMonth }, (_, i) => ({
      value: (i + 1).toString(),
      content: (i + 1).toString(),
    }));
  }

  /**
   * Generates the year range.
   */
  private updateYears(): void {
    const now = dayjs().year();
    const start = this.yearRange()?.startYear ?? now - 100;
    const end = this.yearRange()?.endYear ?? now;

    const from = Math.min(start, end);
    const to = Math.max(start, end);

    this.years = Array.from({ length: to - from + 1 }, (_, i) => {
      const year = to - i;
      return { value: year.toString(), content: year.toString() };
    });
  }

  /**
   * Returns the number of days in a given month and year.
   *
   * @param month - The month (1–12).
   * @param year - Optional year; defaults to current year.
   * @returns The number of days in the specified month/year.
   */
  private getDaysInMonth(month: number, year?: number): number {
    if (!year) {
      year = 2023;
    }
    return dayjs(`${year}-${month}`, 'YYYY-M').daysInMonth();
  }

  /**
   * Updates the `days` list based on the currently selected month and year.
   * Resets the selected day if it exceeds the number of available days.
   */
  private updateDays(): void {
    const year = +this.form.get('year')?.value;
    const month = +this.form.get('month')?.value;

    if (!year || !month) {
      this.days = Array.from({ length: 31 }, (_, i) => ({
        value: (i + 1).toString(),
        content: (i + 1).toString(),
      }));
      return;
    }

    const daysInMonth = dayjs(`${year}-${month}`, 'YYYY-M').daysInMonth();
    this.days = Array.from({ length: daysInMonth }, (_, i) => ({
      value: (i + 1).toString(),
      content: (i + 1).toString(),
    }));

    const currentDay = +this.form.get('day')?.value;
    if (currentDay > daysInMonth) {
      this.form.get('day')?.setValue('');
    }
  }

  /**
   * Applies the current disabled state to all internal controls.
   * Disables or enables each field and updates control validity.
   */
  private updateDisabledState(): void {
    for (const key of Object.keys(this.form.controls)) {
      if (this.isDisabled) {
        this.form.get(key)?.disable({ emitEvent: false });
      } else {
        this.form.get(key)?.enable({ emitEvent: false });
      }
    }
    this.control?.updateValueAndValidity();
  }

  /**
   * Refreshes the `days` list when the 'day' control becomes valid.
   * Ensures accurate day options for selected month/year.
   */
  private refreshDaysAfterDayBecomesValid(): void {
    const year = +this.form.get('year')?.value;
    const month = +this.form.get('month')?.value;

    if (!month) return;

    const daysInMonth = this.getDaysInMonth(month, year);

    this.days = Array.from({ length: daysInMonth }, (_, i) => ({
      value: (i + 1).toString(),
      content: (i + 1).toString(),
    }));
  }

  /**
   * Updates the `months` array with custom labels from `selectsLabels`.
   * Supports localization and dynamic display.
   */
  private updateMonths(): void {
    const monthValues = Object.values(this.selectsLabels()?.months || {});

    if (monthValues.length > 0) {
      for (const [idx, value] of monthValues.entries()) {
        this.months[idx].content = value;
      }
    }
  }

  /**
   * Type guard to check whether a given value is a FormControlState<Dayjs>.
   *
   * @param value - The value to check.
   * @returns True if the value is a FormControlState, false otherwise.
   */
  private isFormControlState(value: any): value is FormControlState<Dayjs> {
    return value && typeof value === 'object' && 'value' in value;
  }

  /** Set the focus on focussable element */
  public override focus(): void {
    if (this.firstControl()) {
      this.firstControl()?.focus();
    }
  }

  /**
   * Set the focus on focussable element when there is an error
   */
  public override focusError(): void {
    this.form.focusFirstInvalidField();
  }

  /**
   * Execute actions when the focus is lost.
   */
  public override executeActionBlur(): void {
    noop();
  }
}
