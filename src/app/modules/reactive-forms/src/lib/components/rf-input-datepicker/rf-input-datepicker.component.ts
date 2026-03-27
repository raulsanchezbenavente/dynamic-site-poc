import { NgClass } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  forwardRef,
  inject,
  input,
  model,
  OnDestroy,
  OnInit,
  viewChild,
} from '@angular/core';
import { FormControlState, NG_VALIDATORS, NG_VALUE_ACCESSOR, ReactiveFormsModule, ValidatorFn } from '@angular/forms';
import { NgbCalendar, NgbDate, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { Subject, takeUntil } from 'rxjs';

import { RfBaseReactiveComponent } from '../../abstract/components/rf-base-reactive.component';
import { RfFormControl } from '../../extensions/components/rf-form-control.component';
import { RfFormGroup } from '../../extensions/components/rf-form-group.component';
import { DateHelper } from '../../helpers/date.helper';
import { RfDebugStateComponent } from '../common/rf-debug-state/rf-debug-state.component';
import { RfDropComponent } from '../common/rf-drop/rf-drop.component';
import { RfErrorMessageSingleComponent } from '../common/rf-error-messages/models/rf-error-messages.model';
import { RfErrorMessagesComponent } from '../common/rf-error-messages/rf-error-messages.component';
import { RfGenericDropButtonComponent } from '../common/rf-generic-drop-button/rf-generic-drop-button.component';
import { RfHintMessagesComponent } from '../common/rf-hint-messages/rf-hint-messages.component';
import { DateAdapter } from '../rf-datepicker/adapters/date.adapter';
import { RfDatepickerRange, RfDatepickerValue } from '../rf-datepicker/models/rf-datepicker-value.model';
import { RfDatepickerComponent } from '../rf-datepicker/rf-datepicker.component';

import { RfInputDatePickerForm } from './models/rf-input-date-picker-form.model';
import { RfInputDatepickerClasses } from './models/rf-input-datepciker-classes.model';

/**
 * Componente de entrada de fecha reutilizable basado en `RfDatepickerComponent` y `RfDropComponent`.
 * Permite seleccionar una fecha única o un rango de fechas, mostrando un calendario desplegable.
 * Compatible con Reactive Forms y con soporte completo de validación y estados de formulario.
 *
 * Selector: `rf-input-datepicker`
 *
 * Extiende `RfBaseReactiveComponent` para integrarse con formularios reactivos personalizados.
 * Implementa interfaces de ciclo de vida `OnInit`, `AfterViewInit` y `OnDestroy`.
 */
@Component({
  selector: 'rf-input-datepicker',
  templateUrl: 'rf-input-datepicker.component.html',
  styleUrls: ['./styles/rf-input-datepicker.styles.scss'],
  host: { class: 'rf-input-datepicker' },
  imports: [
    NgClass,
    RfDatepickerComponent,
    RfDropComponent,
    RfGenericDropButtonComponent,
    RfErrorMessagesComponent,
    RfHintMessagesComponent,
    ReactiveFormsModule,
    RfDebugStateComponent,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RfInputDatepickerComponent),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => RfInputDatepickerComponent),
      multi: true,
    },
  ],
})
export class RfInputDatepickerComponent
  extends RfBaseReactiveComponent<
    RfDatepickerValue | FormControlState<RfDatepickerValue>,
    string,
    RfErrorMessageSingleComponent,
    RfInputDatepickerClasses,
    string
  >
  implements OnInit, AfterViewInit, OnDestroy
{
  /** Reference to the drop component used to control the dropdown behavior */
  public readonly drop = viewChild<RfDropComponent>('drop');

  /** Reference to the inner datepicker component used for calendar rendering */
  public readonly datepicker = viewChild<RfDatepickerComponent>('datepicker');

  /** Reference to the button component that toggles the dropdown */
  public readonly genericbutton = viewChild<RfGenericDropButtonComponent>('drgenericbuttonop');

  /** Placeholder text shown in the input when no date is selected */
  public placeholder = input<string>('');

  /** Label displayed above the input when it contains a value or is focused */
  public animatedLabel = input<string>('');

  /** Minimum selectable date in the calendar */
  public minDate = input<NgbDateStruct>();

  /** Maximum selectable date in the calendar */
  public maxDate = input<NgbDateStruct>();

  /** Number of months displayed side-by-side in the calendar view */
  public displayMonths = input<number>(1);

  /** Whether to show ISO week numbers in the calendar */
  public showWeekNumbers = input<boolean>(false);

  /** How to display days from other months: 'visible', 'collapsed', or 'hidden' */
  public outsideDays = input<string>('hidden');

  /** Specific single date value (in string format) used for initialization */
  public specificDate = input<string | undefined>(undefined);

  /** Enables date range selection mode */
  public rangeEnabled = input<boolean>(false);

  /** Model-bound value representing the start date of the selected range */
  public rangeStartDate = model<NgbDateStruct | null>(null);

  /** Model-bound value representing the end date of the selected range */
  public rangeEndDate = model<NgbDateStruct | null>(null);

  /** Specific start date for range (in string format) used for initialization */
  public specificStartDateRange = input<string | undefined>(undefined);

  /** Specific end date for range (in string format) used for initialization */
  public specificEndDateRange = input<string | undefined>(undefined);

  /** Reactive form group managing the internal control(s) of the component */
  public form!: RfFormGroup;

  /** Name of the icon to display on the right side of the input */
  public rightIcon = input<string>('');

  /** Name of the icon to display on the left side of the input */
  public leftIcon = input<string>('');

  /** If true, hides the dropdown caret (usually a down arrow) from the input */
  public hideCaret = input<boolean>(false);

  /** Class name used for debug and styling purposes */
  public override rfTypeClass: string = 'RfInputDatepickerComponent';

  /** Controls whether the floating label is currently active */
  protected floatingLabel: boolean = false;

  /** Controls the visibility of the calendar dropdown */
  protected calendarVisible = false;

  /** Currently selected date in NgbDateStruct format */
  protected selectedDate!: NgbDateStruct | undefined;

  /** Calendar instance provided by NgbCalendar service */
  protected readonly calendar = inject(NgbCalendar);

  /** Today's date as returned by the calendar service */
  protected today = this.calendar.getToday();

  /** Internal flag to indicate whether the control is disabled */
  protected isDisabled: boolean = false;

  /** Tracks whether the dropdown is currently open */
  protected dropIsOpen = false;

  /** String representation of the selected date or range */
  protected formattedValue = '';

  /** Temporary flag to track key press events for focus management */
  private keyWasPressed: boolean = false;

  /** Adapter used to convert between NgbDateStruct and standard date models */
  private readonly dateAdapter = inject(DateAdapter);

  /** Helper class providing date formatting and conversion utilities */
  private readonly dateHelper = inject(DateHelper);

  /** Subject used to clean up subscriptions on component destruction */
  private readonly $unsubscribe = new Subject<void>();

  /**
   * Lifecycle hook that is called after the component is initialized.
   * Initializes the internal form group and subscribes to value changes.
   */
  public ngOnInit(): void {
    this.form = new RfFormGroup('RF-INPUTDATEPICKER-' + this.randomId, {
      datepicker: new RfFormControl({ value: this.value(), disabled: this.isDisabled }),
    });

    this.form.valueChanges.pipe(takeUntil(this.$unsubscribe)).subscribe((changes: RfInputDatePickerForm) => {
      this.value.set(changes.datepicker);
      this.onChange(changes.datepicker);
    });
  }

  public override getElementRef(): ElementRef {
    return this.genericbutton()!.input()!;
  }

  /**
   * Lifecycle hook that is called after the view has been fully initialized.
   * Registers validators and sets up state synchronization with the control.
   */
  public ngAfterViewInit(): void {
    const validators = (this.getFormControl() as RfFormControl)?.getCustomValidators() as ValidatorFn[];
    if (Array.isArray(validators)) {
      for (const validator of validators) {
        this.form.get('datepicker')?.addValidators(validator);
      }
    }
    this.form.get('datepicker')?.updateValueAndValidity();
    if (this.getFormControl() as RfFormControl) {
      this.registerStateFormEvents(this.getFormControl() as RfFormControl, this.form);
    }
    if (!this.formControlName()) {
      if (this.value()) {
        this.updateValue(this.value());
      }
      this.disabled() ? this.form?.disable() : this.form?.enable();
      this.disabled() ? this.control?.disable() : this.control?.enable();
      this.onChangeDisabledState.subscribe((isDisabled: boolean) => {
        this.isDisabled = isDisabled;
        isDisabled ? this.form?.disable() : this.form?.enable();
        isDisabled ? this.control?.disable() : this.control?.enable();
      });
      this.control?.statusChanges.subscribe(() => {
        this.isDisabled = this.control?.disabled || false;
        this.disabled.set(this.isDisabled);
      });
    }
    this.control?.markAsPristine();
    this.autoId = this.generateAutoId(this.parentId());
  }

  /**
   * Lifecycle hook that is called just before the component is destroyed.
   * Cleans up subscriptions to prevent memory leaks.
   */
  public ngOnDestroy(): void {
    this.$unsubscribe.next();
    this.$unsubscribe.complete();
  }

  /**
   * Called by Angular forms API to write a new value to the component.
   * Updates internal state and form group based on the provided value.
   *
   * @param date The new value to write to the component.
   */
  public override writeValue(date: RfDatepickerValue | FormControlState<RfDatepickerValue>): void {
    this.updateValue(date);
  }

  /**
   * Handles the selection of a date from the calendar.
   * Supports both single date and range selection modes.
   *
   * @param date The selected date, or undefined if cleared.
   */
  protected onSelectDate(date: NgbDateStruct | undefined): void {
    if (!date) {
      this.resetValue();
      return;
    }

    this.selectedDate = date;

    if (this.rangeEnabled()) {
      this.handleRangeMode(new NgbDate(date.year, date.month, date.day));
      if (this.rangeStartDate() && this.rangeEndDate()) {
        const updatedRange = {
          startDate: this.dateAdapter.toModel(this.rangeStartDate())!,
          endDate: this.dateAdapter.toModel(this.rangeEndDate())!,
        };
        this.value.set(updatedRange);
        this.updateFormattedRange();
      }
      if (!this.formControlName()) {
        this.control?.setValue(this.value());
        this.control?.markAsDirty();
      }
      return;
    }

    const singleDate = this.dateHelper.fromNgbDateToUTCDate(new NgbDate(date.year, date.month, date.day));
    this.value.set(singleDate);
    this.updateFormattedSingle(date);
    if (!this.formControlName()) {
      this.control?.setValue(singleDate);
      this.control?.markAsDirty();
    }
  }

  /**
   * Called when the input loses focus.
   * Used to deactivate the floating label.
   */
  protected onBlur(): void {
    this.floatingLabel = false;
  }

  /**
   * Called when the input receives focus.
   * Used to activate the floating label.
   */
  protected onFocus(): void {
    this.floatingLabel = true;
  }

  /**
   * Focuses the datepicker element in select area.
   */
  public override focus(): void {
    if (this.genericbutton()) {
      this.genericbutton()?.focus();
    }
  }

  /**
   * Set the focus on focussable element when there is an error
   */
  public override focusError(): void {
    this.form.focusFirstInvalidField();
  }

  /**
   * Called when the input receives focus.
   * Used to activate the floating label.
   */
  protected onOpen(isOpen: boolean): void {
    this.dropIsOpen = isOpen;
    this.datepicker()?.focus();
  }

  /**
   * Called when focus moves out of the component.
   * Decides whether to mark the control as touched.
   *
   * @param event The blur or focusout event.
   */
  protected handleFocusOut(event: FocusEvent): void {
    const relatedTarget = event.relatedTarget as HTMLElement | null;
    const hostElement = event.currentTarget as HTMLElement;
    if (!relatedTarget && this.keyWasPressed) {
      return;
    }
    if (!relatedTarget || !hostElement.contains(relatedTarget)) {
      this.decideIfEmitTouch();
    }
  }

  /**
   * Determines whether the control should be marked as touched,
   * and emits the onTouched callback when appropriate.
   */
  private decideIfEmitTouch(): void {
    if (this.mouseDownIsInProgress) {
      this.actionBlurIsPending = true;
    } else {
      this.executeActionBlur();
      this.mouseDownIsInProgress = false;
    }
  }

  /**
   * Execute actions when the focus is lost.
   */
  public override executeActionBlur(): void {
    this.drop()?.closeDrop();
    if (!this.formControlName()) {
      this.control?.markAllAsTouched();
    }
    this.form.get('datepicker')?.markAllAsTouched();
    this.onTouched();
  }

  /**
   * Handles key press events to assist with focus handling.
   * Temporarily flags that a key was pressed.
   *
   * @param event The keyboard event.
   */
  public onKeyPressed(event: KeyboardEvent): void {
    this.keyWasPressed = true;
    setTimeout(() => {
      this.keyWasPressed = false;
    }, 200);
  }

  /**
   * Manages the logic for selecting a date range.
   * Updates internal range state based on the selected date.
   *
   * @param date The selected date to apply to the range.
   */
  private handleRangeMode(date: NgbDate): void {
    const start = this.rangeStartDate();
    const end = this.rangeEndDate();

    if (!start || (start && end)) {
      this.rangeStartDate.set(date);
      this.rangeEndDate.set(null);
      return;
    }

    if (!end && date.after(start)) {
      this.rangeEndDate.set(date);
      return;
    }

    if (start && date.equals(start)) {
      this.rangeStartDate.set(null);
      this.rangeEndDate.set(null);
      return;
    }

    this.rangeEndDate.set(start);
    this.rangeStartDate.set(date);
  }

  /**
   * Updates the string representation of the selected single date.
   *
   * @param date The date to format.
   */
  private updateFormattedSingle(date: NgbDateStruct): void {
    this.formattedValue = this.dateHelper.formatNgbDate(date);
  }

  /**
   * Updates the string representation of the selected date range.
   */
  private updateFormattedRange(): void {
    if (this.rangeStartDate() && this.rangeEndDate()) {
      this.formattedValue = `${this.dateHelper.formatNgbDate(this.rangeStartDate()!)} - ${this.dateHelper.formatNgbDate(
        this.rangeEndDate()!
      )}`;
    }
  }

  /**
   * Checks whether a given value is a FormControlState object.
   *
   * @param value The value to check.
   * @returns True if the value is a FormControlState; otherwise, false.
   */
  private isFormControlState(value: any): value is FormControlState<RfDatepickerValue> {
    return value && typeof value === 'object' && 'value' in value;
  }

  /**
   * Updates the internal range selection state from a given model value.
   *
   * @param rangeValue The date range model containing start and end dates.
   */
  private updateRangeFromDate(rangeValue: RfDatepickerRange): void {
    const startNgb = this.dateHelper.fromDateToNgbDate(rangeValue.startDate);
    this.handleRangeMode(startNgb);
    const endNgb = this.dateHelper.fromDateToNgbDate(rangeValue.endDate);
    this.handleRangeMode(endNgb);
  }

  /**
   * Clears the current selection and resets the formatted value.
   */
  private resetValue(): void {
    this.value.set(undefined);
    this.formattedValue = '';
  }

  /**
   * Applies a new value to the component and updates internal state.
   * Handles both single date and range values.
   *
   * @param date The new value to apply.
   */
  private updateValue(date: RfDatepickerValue | FormControlState<RfDatepickerValue>): void {
    if (!date) {
      this.resetValue();
      return;
    }
    this.value.set(date);
    this.form.setValue({ datepicker: date }, { emitEvent: false });

    const actualValue = this.isFormControlState(date) ? date.value : date;

    if (actualValue) {
      if (this.rangeEnabled()) {
        const rangeValue = actualValue as RfDatepickerRange;

        if (typeof rangeValue !== 'object' || !('startDate' in rangeValue) || !('endDate' in rangeValue)) {
          console.warn(
            'Check value, Date Range on Input datepicker must be initialized with startDate and endDate properties'
          );
          return;
        }
        this.updateRangeFromDate(rangeValue);
        this.updateFormattedRange();
        this.value.set({
          startDate: this.dateAdapter.toModel(this.rangeStartDate())!,
          endDate: this.dateAdapter.toModel(this.rangeEndDate())!,
        });
        this.onChange(this.value());
        return;
      }
    }
  }
}
