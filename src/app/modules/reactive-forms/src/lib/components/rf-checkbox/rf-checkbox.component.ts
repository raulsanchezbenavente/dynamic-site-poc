import { NgClass } from '@angular/common';
import {
  AfterContentInit,
  Component,
  ElementRef,
  forwardRef,
  HostBinding,
  model,
  output,
  viewChild,
} from '@angular/core';
import { FormControlState, NG_VALIDATORS, NG_VALUE_ACCESSOR } from '@angular/forms';

import { RfBaseReactiveComponent } from '../../abstract/components/rf-base-reactive.component';
import { RfFormControl } from '../../extensions/components/rf-form-control.component';
import { RfValidatorsConfig } from '../../extensions/types/rf-form-control-validations.types';
import { RfDebugStateComponent } from '../common/rf-debug-state/rf-debug-state.component';
import { RfErrorMessageSingleComponent } from '../common/rf-error-messages/models/rf-error-messages.model';
import { RfErrorMessagesComponent } from '../common/rf-error-messages/rf-error-messages.component';
import { RfHintMessagesComponent } from '../common/rf-hint-messages/rf-hint-messages.component';

import { RfCheckboxClasses } from './models/rf-checkbox-classes.model';

/**
 * Reactive checkbox component compatible with Angular Reactive Forms and standalone usage.
 *
 * Handles group-level checkbox logic, state synchronization, and validation
 * for checkboxes sharing the same `formControlName` or `name`.
 *
 * Features:
 * - Multi-selection using arrays (e.g., `string[]`)
 * - Tracks group structure (first/last checkbox)
 * - Syncs status (touched, dirty, disabled) across group
 * - Supports custom validators and standalone mode
 */
@Component({
  selector: 'rf-checkbox',
  templateUrl: './rf-checkbox.component.html',
  styleUrls: ['./styles/rf-checkbox.styles.scss'],
  host: { class: 'rf-checkbox' },
  standalone: true,
  imports: [NgClass, RfErrorMessagesComponent, RfHintMessagesComponent, RfDebugStateComponent],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RfCheckboxComponent),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => RfCheckboxComponent),
      multi: true,
    },
  ],
})
export class RfCheckboxComponent
  extends RfBaseReactiveComponent<
    string | string[] | FormControlState<string[]>,
    string,
    RfErrorMessageSingleComponent,
    RfCheckboxClasses,
    string
  >
  implements AfterContentInit
{
  /** Reference to the input HTML element */
  public readonly checkbox = viewChild<ElementRef>('checkbox');
  /** Emits true/false when the checkbox is toggled */
  public changeChecked = output<boolean>();
  /** Text label for the checkbox */
  public label = model<string>();
  /** Group name for checkboxes; used for syncing values */
  public name = model<string>(this.idService.generateRandomId());
  /** Optional legend text to describe the group context */
  public legend = model<string>();
  /** Whether the checkbox is disabled */
  public disabledCheckbox = model<boolean>(false);
  /** Whether this checkbox is checked */
  public checked = model<boolean>(false);
  /** True if this checkbox is the first in the group */
  public isFirstCheckboxInGroup = model<boolean>(false);
  /** True if this checkbox is the last in the group */
  public isLastCheckboxInGroup = model<boolean>(false);
  /** Unique label ID for ARIA accessibility */
  public labelId: string = this.idService.generateRandomId();
  /** Full control name within the form (used for grouping) */
  public checkFormName: string = '';
  /** Whether this checkbox is currently selected */
  public isChecked: boolean = false;
  /** Current list of selected values in the group */
  public extractedValues: string[] = [];
  /** Control type identifier used internally */
  public override rfTypeClass: string = 'RfCheckboxComponent';
  /** Store the focus event on blur */
  private focusEvent: FocusEvent | null = null;
  /** Tracks group values by control name */
  private static globalGroups: Record<string, string[]> = {};
  /** Stores raw checkbox values by group */
  private static checkboxValues: Record<string, string | undefined> = {};
  /** Tracks the order of checkboxes in each group */
  private static checkboxOrder: Record<string, string[]> = {};
  /** Previous group ID to compare focus movement */
  private static previosGroupId: string | null = '';
  /** Stores validator config for standalone groups */
  private static validators: Record<string, RfValidatorsConfig> = {};
  /** Stores disabled state per group */
  private static disabled: Record<string, boolean> = {};
  /** Stores error message components per group */
  private static errorMessages: Record<string, RfErrorMessageSingleComponent> = {};
  /** Stores common id for aria describedby checkbox group */
  private static ariaIds: Record<string, string> = {};

  /** Stores common id for aria describedby checkbox group */

  /** Map of checkbox component instances per group */
  public static readonly controls: Record<string, RfCheckboxComponent[] | undefined> = {};

  /**
   * Applies classes to the host element based on `classes()?.container`.
   */
  @HostBinding('class') get hostClasses(): string {
    return this.classes()?.container ?? '';
  }

  /**
   * Lifecycle hook: sets up initial state, validators, group registration,
   * and triggers render-based updates.
   */
  public override ngAfterContentInit(): void {
    super.ngAfterContentInit();
    this.checkFormName = this.formControlName() ? this.getFullFormControlName() : (this.name() ?? '');
    const value = this.ensureStringValue(this.value());
    this.staticOperations(value);
    this.staticOperationsGlobalGroups(value);
    this.staticOperationsOrder(value);
    this.actionsAfterRender();
    this.isChecked = this.checked();
    this.autoId = this.generateAutoId();
  }

  private staticOperations(value: string): void {
    if (this.formControlName() && this.checked()) {
      RfCheckboxComponent.globalGroups[this.checkFormName] = this.extractedValues;
      this.updateValues(true, { touched: false, initial: true, forceChange: true });
    }
    RfCheckboxComponent.checkboxValues[this.checkFormName] = value;
    if (this.errorMessages()) {
      RfCheckboxComponent.errorMessages[this.checkFormName] = this.errorMessages()!;
    }
    if (!this.formControlName()) {
      RfCheckboxComponent.controls[this.checkFormName] ??= [];
      RfCheckboxComponent.controls[this.checkFormName]?.push(this);
      const validators: RfValidatorsConfig = (this.control as RfFormControl)?.getCustomValidators();
      if (typeof validators === 'function' || (Array.isArray(validators) && validators.length > 0)) {
        RfCheckboxComponent.validators[this.checkFormName] = validators;
      }
      if (this.disabled()) {
        RfCheckboxComponent.disabled[this.checkFormName] = this.disabled();
      }
      this.standaloneSubscriptions();
    }
  }

  private ensureStringValue(v: unknown): string {
    if (v == null) return '';
    if (typeof v === 'string') return v;
    console.warn(
      '[Rf*Component] Expected a string in `value`, received:',
      v,
      ' — Convert the value in the container before passing it to the component.'
    );
    return String(JSON.stringify(v));
  }

  private staticOperationsGlobalGroups(value: string): void {
    if (!RfCheckboxComponent.globalGroups[this.checkFormName]) {
      RfCheckboxComponent.globalGroups[this.checkFormName] = [];
    }
    if (this.formControlName()) {
      if (!RfCheckboxComponent.globalGroups[this.checkFormName].includes(value)) {
        RfCheckboxComponent.globalGroups[this.checkFormName].push(value);
      }
    } else if (this.checked()) {
      RfCheckboxComponent.globalGroups[this.checkFormName].push(value);
    }
  }

  private staticOperationsOrder(value: string): void {
    if (!RfCheckboxComponent.checkboxOrder[this.checkFormName]) {
      RfCheckboxComponent.checkboxOrder[this.checkFormName] = [];
    }
    if (!RfCheckboxComponent.checkboxOrder[this.checkFormName].includes(value)) {
      RfCheckboxComponent.checkboxOrder[this.checkFormName].push(value);
    }
  }

  public override getElementRef(): ElementRef {
    return this.checkbox()!;
  }

  /**
   * Called after initial render to:
   * - Set first/last flags
   * - Assign error messages
   * - Sync selected values and validators
   */
  private actionsAfterRender(): void {
    requestAnimationFrame(() => {
      if (!RfCheckboxComponent.ariaIds[this.checkFormName]) {
        RfCheckboxComponent.ariaIds[this.checkFormName] = this.randomId;
      }
      this.ariaId.set(RfCheckboxComponent.ariaIds[this.checkFormName]);

      if (RfCheckboxComponent.checkboxOrder[this.checkFormName][0] === this.value()) {
        this.isFirstCheckboxInGroup.set(true);
      }
      if (RfCheckboxComponent.checkboxValues[this.checkFormName] === this.value()) {
        this.isLastCheckboxInGroup.set(true);
      }
      if (this.isLastCheckboxInGroup()) {
        this.errorMessages.set(RfCheckboxComponent.errorMessages[this.checkFormName]);
      }
      if (!this.formControlName()) {
        this.setValueInStandaloneMode(RfCheckboxComponent.globalGroups[this.checkFormName] || []);
        this.setValidatorsInStandaloneMode();
        this.setStatusInStandaloneMode(RfCheckboxComponent.disabled[this.checkFormName] ? 'disable' : 'enable');
      }
      this.updateValues(this.isChecked, { touched: false, initial: true, forceChange: true });
      this.changeDetector.markForCheck();
      this.handleSendEvents();
    });
  }

  /**
   * Writes the checkbox value from the form control.
   * Converts the value to array and updates checked state accordingly.
   *
   * @param values Value from form control (array or FormControlState)
   */
  public override writeValue(values: string[] | FormControlState<string[]>): void {
    const value = this.ensureStringValue(this.value());
    let extractedValues: string[] = [];
    if (values) {
      if (Array.isArray(values)) {
        extractedValues = [...values];
      } else if (typeof values === 'object' && 'value' in values) {
        extractedValues = [...values.value];
      }
    }
    this.extractedValues = extractedValues;
    if (this.value()) {
      this.isChecked = extractedValues.includes(value) || this.checked();
      this.checked.set(this.isChecked);
    }
  }

  /**
   * Called when user interacts with checkbox input.
   * Updates values and emits `changeChecked`.
   *
   * @param event Native change event from checkbox input
   */
  public onCheckboxChange(event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    this.updateValues(isChecked);
    this.changeChecked.emit(isChecked);
  }

  /**
   * Converts a value to string safely, avoiding Object's default toString.
   */
  private convertValueToString(val: unknown): string {
    return typeof val === 'string' ? val : `${val}`;
  }

  /**
   * Updates group-level value array when this checkbox is toggled.
   * Can optionally mark control as touched or force value emission.
   *
   * @param isChecked Whether this checkbox is currently checked
   * @param opts Optional flags for update behavior
   */
  public updateValues(
    isChecked: boolean,
    opts?: { touched?: boolean; initial?: boolean; forceChange?: boolean }
  ): void {
    const dirtyStatus: boolean | undefined = this.control?.dirty;
    let updatedValues = [...(RfCheckboxComponent.globalGroups[this.checkFormName] || [])];

    // Update values based on checked state
    if (isChecked && this.value()) {
      const valueString = this.convertValueToString(this.value());
      if (!updatedValues.includes(valueString)) {
        updatedValues.push(valueString);
      }
    } else {
      updatedValues = updatedValues.filter((v) => v !== this.value());
    }
    const order = RfCheckboxComponent.checkboxOrder[this.checkFormName] || [];
    const selectedSet = new Set(updatedValues);
    updatedValues = order.filter((v) => selectedSet.has(v));

    RfCheckboxComponent.globalGroups[this.checkFormName] = updatedValues;

    const shouldCallChange = !opts?.initial || opts?.forceChange;
    if (shouldCallChange) {
      this.onChange([...updatedValues]);
      opts?.initial && (dirtyStatus ? this.control?.markAsDirty() : this.control?.markAsPristine());
    }

    if (!this.formControlName() && this.name()) {
      this.setValueInStandaloneMode(updatedValues);
      this.setStatusInStandaloneMode('markAsDirty');
    }
    this.isChecked = isChecked;
  }

  /**
   * Sets the checkbox value programmatically.
   *
   * @param checked Whether the checkbox should be checked
   */
  public setChecked(checked: boolean): void {
    if (this.control) {
      this.isChecked = checked;
      this.updateValues(checked);
    }
  }

  /** Set the focus on focussable element */
  public override focus(): void {
    if (this.checkbox()) {
      this.checkbox()?.nativeElement.focus();
    }
  }

  /**
   * Set the focus on focussable element when there is an error
   */
  public override focusError(): void {
    this.focus();
  }

  /**
   * Handles blur event and marks form as touched
   * only when focus moves outside the group.
   *
   * @param event Focus event from input
   */
  protected handleBlur(event: FocusEvent): void {
    this.focusEvent = event;
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
    requestAnimationFrame(() => {
      const currentElement = document.activeElement as HTMLElement;
      const currentGroupId = currentElement?.dataset['checkboxGroup'];
      const previoudElement = this.focusEvent?.target as HTMLElement;
      RfCheckboxComponent.previosGroupId = previoudElement?.dataset['checkboxGroup'] ?? null;
      if (currentGroupId !== RfCheckboxComponent.previosGroupId) {
        this.onTouched();
        this.control?.markAsTouched();
      }
    });
  }

  /**
   * Updates checkbox group value manually in standalone mode.
   *
   * @param value Array of selected values to apply
   * @param emitEvent Whether to emit value change event
   */
  private setValueInStandaloneMode(value: string[], emitEvent = true): void {
    const group = RfCheckboxComponent.controls[this.checkFormName] || [];
    for (const checkbox of group) {
      checkbox.control?.setValue(value, { emitEvent: emitEvent });
    }
  }

  /**
   * Sets `isChecked` status across all checkboxes in group (standalone mode).
   *
   * @param values List of selected values to mark as checked
   */
  private setCheckedInStandaloneMode(values: string[]): void {
    const group = RfCheckboxComponent.controls[this.checkFormName] || [];
    for (const checkbox of group) {
      const checkboxValue = this.convertValueToString(checkbox.value());
      const isChecked = values.includes(checkboxValue);
      checkbox.isChecked = isChecked;
    }
  }

  /**
   * Applies custom validators to the group in standalone mode.
   */
  private setValidatorsInStandaloneMode(): void {
    const validatorsConfig: RfValidatorsConfig = RfCheckboxComponent.validators[this.checkFormName];
    const group = RfCheckboxComponent.controls[this.checkFormName] || [];
    for (const checkbox of group) {
      if (typeof validatorsConfig === 'function' || (Array.isArray(validatorsConfig) && validatorsConfig.length > 0)) {
        checkbox.control?.setValidators(validatorsConfig);
      }
      (checkbox.control as RfFormControl)?.setCustomValidators(validatorsConfig);
      checkbox.control?.updateValueAndValidity();
    }
  }

  /**
   * Registers subscriptions to form control state events (e.g., markAsTouched).
   * Only applies in standalone mode.
   */
  private standaloneSubscriptions(): void {
    this.control?.statusChanges.subscribe(() => {
      const isDisabled: boolean = this.control?.disabled || false;
      this.setStatusInStandaloneMode(isDisabled ? 'disable' : 'enable');
    });
    (this.control as RfFormControl)?.onMarkAllAsTouched.subscribe(() => {
      this.setStatusInStandaloneMode('markAllAsTouched');
    });
    (this.control as RfFormControl)?.onMarkAsTouched.subscribe(() => {
      this.setStatusInStandaloneMode('markAsTouched');
    });
    (this.control as RfFormControl)?.onMarkAsUntouched.subscribe(() => {
      this.setStatusInStandaloneMode('markAsUntouched');
    });
    (this.control as RfFormControl)?.onMarkAllAsDirty.subscribe(() => {
      this.setStatusInStandaloneMode('markAllAsDirty');
    });
    (this.control as RfFormControl)?.onMarkAsDirty.subscribe(() => {
      this.setStatusInStandaloneMode('markAsDirty');
    });
    (this.control as RfFormControl)?.onMarkAsPristine.subscribe(() => {
      this.setStatusInStandaloneMode('markAsPristine');
    });
  }

  /**
   * Invokes form control status methods across all checkboxes in the group.
   *
   * @param action Name of method to call on form control (e.g., "markAsDirty")
   */
  private setStatusInStandaloneMode(action: string): void {
    const checkboxes = RfCheckboxComponent.controls[this.checkFormName] || [];
    for (const checkbox of checkboxes) {
      const control = checkbox.control;
      if (control instanceof RfFormControl && typeof control[action as keyof RfFormControl] === 'function') {
        (control[action as keyof RfFormControl] as Function).call(control, { emitEvent: false });
        this.changeDetector.markForCheck();
      }
    }
  }

  /**
   * Handles external `setValue()` events from parent form control.
   * Applies updated selection state to all checkboxes.
   */
  private handleSendEvents(): void {
    (this.control as RfFormControl)?.onSetValue.subscribe((values: string[]) => {
      if (this.formControlName()) {
        RfCheckboxComponent.globalGroups[this.checkFormName] = values;
        for (const component of (this.control as RfFormControl).rfComponent as []) {
          const typedComp: RfCheckboxComponent = component as RfCheckboxComponent;
          typedComp.isChecked = values.includes(typedComp.value() as string);
        }
      } else {
        this.setValueInStandaloneMode(values, false);
        this.setCheckedInStandaloneMode(values);
        RfCheckboxComponent.globalGroups[this.checkFormName] = values;
      }
    });
  }
}
