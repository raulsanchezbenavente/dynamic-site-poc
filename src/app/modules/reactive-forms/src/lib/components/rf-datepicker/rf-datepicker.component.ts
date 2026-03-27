/* eslint-disable @typescript-eslint/no-unused-expressions */
import { NgClass } from '@angular/common';
import {
  AfterContentInit,
  AfterViewInit,
  Component,
  effect,
  ElementRef,
  forwardRef,
  inject,
  input,
  model,
  OnDestroy,
  OnInit,
  output,
  Renderer2,
  signal,
  viewChild,
} from '@angular/core';
import { FormControlState, FormsModule, NG_VALIDATORS, NG_VALUE_ACCESSOR } from '@angular/forms';
import { NgbCalendar, NgbDate, NgbDatepicker, NgbDatepickerModule, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import dayjs, { Dayjs } from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { Subject, takeUntil } from 'rxjs';

import { RfBaseReactiveComponent } from '../../abstract/components/rf-base-reactive.component';
import { DateHelper } from '../../helpers/date.helper';
import { RfDebugStateComponent } from '../common/rf-debug-state/rf-debug-state.component';
import { RfErrorMessageSingleComponent } from '../common/rf-error-messages/models/rf-error-messages.model';
import { RfErrorMessagesComponent } from '../common/rf-error-messages/rf-error-messages.component';
import { RfHintMessagesComponent } from '../common/rf-hint-messages/rf-hint-messages.component';

import { DateAdapter } from './adapters/date.adapter';
import { RfDatepickerClasses } from './models/rf-datepicker-classes.model';
import { RfDatepickerRange, RfDatepickerValue } from './models/rf-datepicker-value.model';
import { SpecificDate } from './validators/specific-date.validator';
import { SpecificDateRange } from './validators/specific-range-required.validator';
dayjs.extend(utc);

/**
 * RfDatepickerComponent is a reusable Angular component for selecting single dates or date ranges
 * within a reactive form context. It supports validation, accessibility, and full control
 * over min/max dates and specific allowed dates.
 *
 * @extends RfBaseReactiveComponent
 * @implements OnInit, AfterContentInit, AfterViewInit, OnDestroy
 */
@Component({
  selector: 'rf-datepicker',
  templateUrl: 'rf-datepicker.component.html',
  styleUrls: ['./styles/rf-datepicker.styles.scss'],
  host: { class: 'rf-datepicker' },
  imports: [
    FormsModule,
    NgClass,
    RfErrorMessagesComponent,
    RfHintMessagesComponent,
    NgbDatepickerModule,
    RfDebugStateComponent,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RfDatepickerComponent),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => RfDatepickerComponent),
      multi: true,
    },
  ],
})
export class RfDatepickerComponent
  extends RfBaseReactiveComponent<
    RfDatepickerValue | FormControlState<RfDatepickerValue>,
    string,
    RfErrorMessageSingleComponent,
    RfDatepickerClasses,
    string
  >
  implements OnInit, AfterContentInit, AfterViewInit, OnDestroy
{
  /** Emits keydown events from the datepicker input. */
  public keyDown = output<KeyboardEvent>();

  /** Reference to the NgbDatepicker instance. */
  public readonly datepicker = viewChild<NgbDatepicker>('datepicker');

  /** Reference to the native element of the datepicker container. */
  public readonly datepickerRef = viewChild<ElementRef>('datepickerRef');

  /** Currently selected date in single-date mode. */
  public dateSelected = model<NgbDateStruct>();

  /** Minimum selectable date in the calendar. */
  public minDate = input<NgbDateStruct>();

  /** Maximum selectable date in the calendar. */
  public maxDate = input<NgbDateStruct>();

  /** Number of months displayed in the calendar view. Default is 1. */
  public displayMonths = input<number>(1);

  /** Whether to display ISO week numbers alongside the calendar. */
  public showWeekNumbers = input<boolean>(false);

  /** Whether to show, hide or collapse days outside the current month. */
  public outsideDays = input<string>('hidden');

  /** Specific date allowed for selection (used for validation). */
  public specificDate = input<string | undefined>(undefined);

  /** Whether range selection mode is enabled. */
  public rangeEnabled = input<boolean>(false);

  /** Selected start date when using range selection. */
  public rangeStartDate = model<NgbDateStruct | null>(null);

  /** Selected end date when using range selection. */
  public rangeEndDate = model<NgbDateStruct | null>(null);

  /** Specific start date allowed in range (used for validation). */
  public specificStartDateRange = input<string | undefined>(undefined);

  /** Specific end date allowed in range (used for validation). */
  public specificEndDateRange = input<string | undefined>(undefined);

  /** Identifier string for component type (used for styling/debugging). */
  public override rfTypeClass: string = 'RfDatepickerComponent';

  /** Last selected date in Dayjs format, used for internal tracking. */
  protected lastSelectedDate = signal<Dayjs | undefined>(undefined);

  /** Temporary selected date (single mode). */
  protected selectedDate!: NgbDateStruct;

  /** Currently hovered date in range mode. */
  protected hoveredDate = signal<NgbDate | null>(null);

  /** Today's date provided by NgbCalendar. */
  protected today = inject(NgbCalendar).getToday();

  /** Instance of DateHelper used for date comparison and formatting. */
  protected readonly dateHelper = inject(DateHelper);

  /** Adapter to convert between NgbDateStruct and Dayjs. */
  private readonly dateAdapter = inject(DateAdapter);

  /** Renderer2 instance used for DOM manipulations. */
  private readonly renderer = inject(Renderer2);

  /** Element reference of the component’s host element. */
  private readonly elRef = inject(ElementRef);

  /** Subject used to unsubscribe from observables on destroy. */
  private readonly $unsubscribe = new Subject<void>();

  /** React to parentId changes to compute the component autoId */
  private readonly parentIdEffect = effect(() => {
    this.autoId = this.parentAutoId();
    this.changeDetector.markForCheck();
  });

  /**
   * Lifecycle hook that initializes the component.
   */
  public ngOnInit(): void {
    if (this.value() === undefined) {
      this.value.set(undefined);
      this.lastSelectedDate.set(undefined);
    }

    if (!this.formControlName()) {
      this.onChangeDisabledState.pipe(takeUntil(this.$unsubscribe)).subscribe((isDisabled) => {
        isDisabled ? this.control?.disable() : this.control?.enable();
      });
    }
  }

  public override getElementRef(): ElementRef {
    return this.datepickerRef()!;
  }

  /**
   * Lifecycle hook that runs after content projection.
   */
  public override ngAfterContentInit(): void {
    super.ngAfterContentInit();
    this.addSpecificDatesValidation();
    if (!this.formControlName()) {
      this.setValue(this.value());
      this.disabled() ? this.control?.disable() : this.control?.enable();
    }
  }

  /**
   * Lifecycle hook that runs after the component's view has been fully initialized.
   */
  public ngAfterViewInit(): void {
    if (this.rangeStartDate()) {
      this.datepicker()?.navigateTo(this.rangeStartDate()!);
    }
    if (this.dateSelected()) {
      this.datepicker()?.navigateTo(this.dateSelected());
    }

    if (this.readonly()) {
      const hostElement = this.elRef.nativeElement as HTMLElement;
      const datepickerEl = hostElement.querySelector('ngb-datepicker');

      if (datepickerEl) {
        const monthElements = datepickerEl.querySelectorAll('ngb-datepicker-month');
        for (const elem of Array.from(monthElements)) {
          this.renderer.addClass(elem, 'readonly');
        }
      }
    }
    if (!this.formControlName()) {
      this.onChangeDisabledState.subscribe((isDisabled: boolean) => {
        isDisabled ? this.control?.disable() : this.control?.enable();
      });
      this.control?.statusChanges.subscribe(() => {
        this.disabled.set(!this.control?.enabled || false);
      });
    }

    this.datepickerRef()?.nativeElement.addEventListener(
      'keydown',
      (event: KeyboardEvent) => {
        this.keyDown.emit(event);
      },
      true
    );
    this.autoId = this.generateAutoId();
  }

  /**
   * Lifecycle hook that is called when the component is destroyed.
   */
  public ngOnDestroy(): void {
    this.$unsubscribe.next();
    this.$unsubscribe.complete();
  }

  /**
   * Writes a value from the model into the view.
   * @param value The new value to be set.
   */
  public override writeValue(value: RfDatepickerValue | FormControlState<RfDatepickerValue>): void {
    this.setValue(value);
  }

  /**
   * Formats a date object into an ID string.
   * @param date The date to format.
   * @returns A string representation for use as an element ID.
   */
  public formatDateId(date: { year: number; month: number; day: number }): string {
    const yyyy = date.year;
    const mm = String(date.month).padStart(2, '0');
    const dd = String(date.day).padStart(2, '0');
    return `${this.getFullFormControlName()}-${yyyy}${mm}${dd}`;
  }

  /**
   * Formats a date object into an e2e string.
   * @param date The date to format.
   * @returns A string representation for use as an element ID.
   */
  public formatE2EId(date: { year: number; month: number; day: number }): string {
    const yyyy = date.year;
    const mm = String(date.month).padStart(2, '0');
    const dd = String(date.day).padStart(2, '0');
    return `${this.autoId}||${yyyy}${mm}${dd}::day`;
  }

  /**
   * Focuses the datepicker element.
   */
  public override focus(): void {
    if (this.datepicker()) {
      this.datepicker()?.focus();
    }
  }

  /**
   * Set the focus on focussable element when there is an error
   */
  public override focusError(): void {
    this.focus();
  }

  /**
   * Handles keydown events and emits them if the component is enabled.
   * @param event The keyboard event.
   */
  public handleKeyDown(event: KeyboardEvent): void {
    if (!this.readonly() && !this.disabled()) {
      this.keyDown.emit(event);
    }
  }

  /**
   * Handles the date selection logic depending on range mode.
   * @param date The selected date.
   */
  protected onSelectDate(date: NgbDate): void {
    if (this.readonly()) {
      return;
    }

    if (this.rangeEnabled()) {
      this.handleRangeMode(date);
    } else {
      this.handleSimpleMode(date);
    }
  }

  /**
   * Determines if a date should be disabled based on min/max limits.
   * @param date The date to check.
   * @returns True if the date is not selectable.
   */
  protected disableDate = (date: NgbDateStruct): boolean => {
    if (this.minDate() && this.dateHelper.compareDates(date, this.minDate()!) < 0) {
      return true;
    }

    if (this.maxDate() && this.dateHelper.compareDates(date, this.maxDate()!) > 0) {
      return true;
    }

    return false;
  };

  /**
   * Determines whether a date is in a hovered state.
   * @param date The date to evaluate.
   * @returns True if the date is being hovered in range selection mode.
   */
  protected isHovered(date: NgbDate): boolean {
    return (
      !!this.rangeStartDate() &&
      !this.rangeEndDate() &&
      !!this.hoveredDate() &&
      date.after(this.rangeStartDate()) &&
      date.before(this.hoveredDate())
    );
  }

  /**
   * Determines whether a date is within the currently selected range.
   * @param date The date to evaluate.
   * @returns True if the date lies between the start and end of the range.
   */
  protected isInside(date: NgbDate): boolean {
    return (
      !!this.rangeStartDate() &&
      !!this.rangeEndDate() &&
      date.after(this.rangeStartDate()) &&
      date.before(this.rangeEndDate())
    );
  }

  /**
   * Checks whether the given date is part of the current range selection.
   * @param date The date to evaluate.
   * @returns True if it is a range boundary or in between.
   */
  protected isRange(date: NgbDate): boolean {
    const start = this.rangeStartDate();
    const end = this.rangeEndDate();
    const hover = this.hoveredDate();

    // Finalized range: include start, end, and in-between
    if (start && end) {
      return date.equals(start) || date.equals(end) || this.isInside(date);
    }

    // In-progress hover: include start and intermediate days
    if (hover?.after?.(start)) {
      return date.equals(start) || (date.after(start) && date.before(hover));
    }

    return false;
  }

  /**
   * Determines if a date is the current hovered end date.
   * @param date The date to check.
   * @returns True if the date is the hovered end.
   */
  protected isHoveredEndDate(date: NgbDate): boolean {
    return !!this.rangeStartDate() && !this.rangeEndDate() && !!this.hoveredDate() && date.equals(this.hoveredDate());
  }

  /**
   * Handles blur events and emits touch state if applicable.
   * @param event The focus out event.
   */
  protected handleFocusOut(event: FocusEvent): void {
    if (!this.parentId()) {
      const relatedTarget = event.relatedTarget as HTMLElement | null;
      const hostElement = event.currentTarget as HTMLElement;
      if (!relatedTarget || !hostElement.contains(relatedTarget)) {
        this.decideIfEmitTouch();
      }
    }
  }

  /**
   * Emits the touch event manually if the control is not part of a form group.
   */
  protected decideIfEmitTouch(): void {
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
    if (!this.formControlName()) {
      this.control?.markAsTouched();
    }
    this.onTouched();
  }

  /**
   * Checks whether the given date matches today's date.
   * @param date The date to evaluate.
   * @returns True if the date is today.
   */
  protected isToday(date: NgbDate): boolean {
    return date.equals(this.today);
  }

  /**
   * Handles single date selection logic.
   * Updates selected date and propagates model changes.
   * @param date The selected NgbDate.
   */
  private handleSimpleMode(date: NgbDate): void {
    this.dateSelected.set(date);
    const modelDate = this.dateAdapter.toModel(date);

    this.value.set(modelDate!);
    this.lastSelectedDate.set(modelDate!);
    this.onChange(modelDate!);
    if (!this.formControlName()) {
      this.control?.setValue(this.dateHelper.fromNgbDateToUTCDate(date));
      this.control?.markAsDirty();
    }
  }

  /**
   * Handles date selection logic in range mode.
   * Updates rangeStartDate and rangeEndDate accordingly.
   * @param date The selected NgbDate.
   */
  private handleRangeMode(date: NgbDate): void {
    if (!this.rangeEnabled()) {
      this.value.set(undefined);
      this.lastSelectedDate.set(undefined);
      this.onChange(undefined);
      return;
    }

    const start = this.rangeStartDate();
    const end = this.rangeEndDate();

    if (!start || (start && end)) {
      this.rangeStartDate.set(date);
      this.lastSelectedDate.set(this.dateAdapter.toModel(date)!);
      this.rangeEndDate.set(null);
      this.updateChange();
      return;
    }

    if (!end && date.after(start)) {
      this.rangeEndDate.set(date);
      this.lastSelectedDate.set(this.dateAdapter.toModel(date)!);
      this.updateChange();
      return;
    }

    if (start && date.equals(start)) {
      this.rangeStartDate.set(null);
      this.rangeEndDate.set(null);
      this.updateChange();
      return;
    }

    this.rangeEndDate.set(start);
    this.rangeStartDate.set(date);
    this.updateChange();
  }

  /**
   * Updates form control and model with the selected range.
   */
  private updateChange(): void {
    const start = this.rangeStartDate();
    const end = this.rangeEndDate();

    if (start && !end) {
      const partialDate: RfDatepickerRange = {
        startDate: this.dateAdapter.toModel(start)!,
        endDate: null as any,
      };
      this.value.set(partialDate);
      this.onChange(partialDate);
      if (!this.formControlName()) {
        this.control?.setValue(partialDate);
        this.control?.markAsTouched();
        this.control?.updateValueAndValidity();
      }
      return;
    }

    if (start && end) {
      const newDate: RfDatepickerRange = {
        startDate: this.dateAdapter.toModel(start)!,
        endDate: this.dateAdapter.toModel(end)!,
      };
      this.value.set(newDate);
      this.onChange(newDate);
      if (!this.formControlName()) {
        this.control?.setValue(newDate);
        this.control?.markAsDirty();
        this.control?.markAsTouched();
      }
    }
  }

  /**
   * Clears selected date(s) and resets internal state.
   */
  private clearSelections(): void {
    this.dateSelected.set(undefined);
    this.rangeStartDate.set(null);
    this.rangeEndDate.set(null);
  }

  /**
   * Type guard to check if a value is a date range object.
   * @param val Value to check.
   * @returns True if the value is a range with startDate and endDate.
   */
  private isRangeValue(val: RfDatepickerValue): val is { startDate: Dayjs; endDate: Dayjs } {
    return typeof val === 'object' && !!val && 'startDate' in val && 'endDate' in val;
  }

  /**
   * Adds custom validators for specificDate or specificDateRange.
   */
  private addSpecificDatesValidation(): void {
    const control = this.getFormControl();

    if (control) {
      if (this.rangeEnabled() && this.specificStartDateRange() && this.specificEndDateRange()) {
        control.addValidators(SpecificDateRange(this.specificStartDateRange()!, this.specificEndDateRange()!));

        this.updateErrorMessages('specificStartDateRange', this.specificStartDateRange()!);
        this.updateErrorMessages('specificEndDateRange', this.specificEndDateRange()!);
        this.updateErrorMessages(
          'invalidSpecificDateRange',
          `${this.specificStartDateRange()!} and ${this.specificEndDateRange()!}`
        );
      }

      if (this.specificDate()) {
        control.addValidators(SpecificDate(this.specificDate()!));
        this.updateErrorMessages('invalidSpecificDate', this.specificDate()!);
      }
    }
  }

  /**
   * Updates error messages with contextual values.
   * @param key Error key to update.
   * @param replace Replacement string.
   */
  private updateErrorMessages(key: string, replace: string): void {
    this.errorMessages.update((err) => {
      if (!err) return err;
      if (err[key]) {
        err[key] = err[key]?.replace(`{{${key}}}`, replace);
      }
      return err;
    });
  }

  /**
   * Checks if the provided value is a FormControlState.
   * @param value Value to check.
   * @returns True if value is a FormControlState object.
   */
  private isFormControlState(value: any): value is FormControlState<RfDatepickerValue> {
    return value && typeof value === 'object' && 'value' in value;
  }

  /**
   * Parses and applies the given date or date range value.
   * Navigates the calendar and updates internal state.
   * @param value Value to apply.
   */
  private setValue(value: RfDatepickerValue | FormControlState<RfDatepickerValue>): void {
    if (!value) {
      this.clearSelections();
    }
    const provisionalValue = this.isFormControlState(value) ? value.value : value;
    if (!this.isRangeValue(provisionalValue) && this.rangeEnabled()) {
      console.warn('Check value, if range is enable you must set { startDate: Date, endDate: Date } object.');
    }
    if (this.isRangeValue(provisionalValue)) {
      const actualValue = {
        startDate: provisionalValue.startDate.hour(0).minute(0).second(0).millisecond(0),
        endDate: provisionalValue.endDate.hour(0).minute(0).second(0).millisecond(0),
      };
      this.rangeStartDate.set(this.dateAdapter.fromModel(actualValue.startDate));
      this.rangeEndDate.set(this.dateAdapter.fromModel(actualValue.endDate));
      this.lastSelectedDate.set(actualValue.endDate);
      if (this.datepicker()) {
        this.datepicker()?.navigateTo(this.rangeStartDate()!);
      }
      requestAnimationFrame(() => {
        this.onChange(actualValue);
      });
    } else if (provisionalValue) {
      const actualValue = provisionalValue.hour(0).minute(0).second(0).millisecond(0);
      this.dateSelected.set(this.dateAdapter.fromModel(actualValue)!);
      this.lastSelectedDate.set(actualValue);
      if (this.datepicker()) {
        this.datepicker()?.navigateTo(this.dateSelected());
      }
      requestAnimationFrame(() => {
        this.onChange(actualValue);
      });
    }
  }
}
