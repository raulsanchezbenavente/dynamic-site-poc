import { NgClass } from '@angular/common';
import {
  AfterContentInit,
  Component,
  ElementRef,
  forwardRef,
  HostBinding,
  model,
  OnInit,
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

import { RfRadioClasses } from './models/rf-radio-classes.model';

/**
 * Reactive radio button component compatible with Angular Reactive Forms and standalone usage.
 *
 * Handles group behavior, validation, and status synchronization across multiple radio buttons
 * sharing the same `formControlName` or `name`.
 *
 * Features:
 * - Mutual exclusion (one selected value per group)
 * - Standalone mode with value propagation and validation
 * - Custom group tracking and ordering (first/last)
 * - ARIA support and accessibility via labelId
 */
@Component({
  selector: 'rf-radio',
  templateUrl: './rf-radio.component.html',
  styleUrls: ['./styles/rf-radio.styles.scss'],
  host: { class: 'rf-radio' },
  standalone: true,
  imports: [NgClass, RfErrorMessagesComponent, RfHintMessagesComponent, RfDebugStateComponent],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RfRadioComponent),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => RfRadioComponent),
      multi: true,
    },
  ],
})
export class RfRadioComponent
  extends RfBaseReactiveComponent<string, string, RfErrorMessageSingleComponent, RfRadioClasses, string>
  implements OnInit, AfterContentInit
{
  /** Emits true/false when a radio button is selected */
  public changeSelected = output<boolean>();
  /** Reference to the radio input element */
  public elementRef = viewChild<ElementRef>('input');
  /** Label text for the radio button */
  public label = model<string>();
  /** Name used for grouping radio buttons */
  public name = model<string>(this.idService.generateRandomId());
  /** Optional legend for the group context */
  public legend = model<string>();
  /** Whether this radio is selected initially */
  public checked = model<boolean>(false);
  /** Whether this radio is disabled */
  public disabledRadio = model<boolean>(false);
  /** Whether this is the first radio in the group */
  public isFirstRadioInGroup = model<boolean>(false);
  /** Whether this is the last radio in the group */
  public isLastRadioInGroup = model<boolean>(false);
  /** Currently selected value for the group */
  public selectedValue: string = '';
  /** Full control name within the form */
  public radioFormName: string = '';
  /** Internal flag indicating selection */
  public isSelected: boolean = false;
  /** Control type identifier */
  public override rfTypeClass: string = 'RfRadioComponent';
  /** Store the focus event on blur */
  private focusEvent: FocusEvent | null = null;
  /** Tracks raw radio values per group */
  private static radioValues: Record<string, string | undefined> = {};
  /** Tracks registration of values in group */
  private static radioValueRegistered: Record<string, string | undefined> = {};
  /** Tracks which value is checked initially */
  private static radioChecked: Record<string, string | undefined> = {};
  /** Validators for standalone radio groups */
  private static validators: Record<string, RfValidatorsConfig> = {};
  /** Disabled status per group */
  private static disabled: Record<string, boolean> = {};
  /** Previous group ID used to detect blur across group */
  private static previosGroupId: string | null = '';
  /** Error messages per group */
  private static errorMessages: Record<string, RfErrorMessageSingleComponent> = {};
  /** Stores common id for aria describedby checkbox group */
  private static ariaIds: Record<string, string> = {};

  /** Map of all radio components grouped by name */
  public static readonly controls: Record<string, RfRadioComponent[] | undefined> = {};

  @HostBinding('class') get hostClasses(): string {
    return this.classes()?.container ?? '';
  }

  /**
   * Lifecycle hook called when the component is initialized.
   * Sets up listener for disabled state in standalone mode.
   */
  public ngOnInit(): void {
    if (!this.formControlName()) {
      this.onChangeDisabledState.subscribe((isDisabled: boolean) => {
        this.setStatusInStandaloneMode(isDisabled ? 'disable' : 'enable');
      });
    }
  }

  public override getElementRef(): ElementRef {
    return this.elementRef()!;
  }

  /**
   * Lifecycle hook called after the component's view has been fully initialized.
   * Registers the radio into its group and applies initial state and validators.
   */
  public override ngAfterContentInit(): void {
    super.ngAfterContentInit();
    this.radioFormName = this.formControlName() ? this.getFullFormControlName() : (this.name() ?? '');
    RfRadioComponent.radioValues[this.radioFormName] = this.value();
    if (this.errorMessages()) {
      RfRadioComponent.errorMessages[this.radioFormName] = this.errorMessages()!;
    }
    if (!this.formControlName()) {
      RfRadioComponent.controls[this.radioFormName] ??= [];
      RfRadioComponent.controls[this.radioFormName]?.push(this);
      if (this.checked()) {
        RfRadioComponent.radioChecked[this.radioFormName] = this.value();
      }
      const validators: RfValidatorsConfig = (this.control as RfFormControl)?.getCustomValidators();
      if (typeof validators === 'function' || (Array.isArray(validators) && validators.length > 0)) {
        RfRadioComponent.validators[this.radioFormName] = validators;
      }
      if (this.disabled()) {
        RfRadioComponent.disabled[this.radioFormName] = this.disabled();
      }
      this.standaloneSubscriptions();
    }
    this.actionsAfterRender();
    this.isSelected = this.checked();
    this.autoId = this.generateAutoId();
  }

  /**
   * Writes a new value from the form control into the radio component.
   * Also updates the selected state accordingly.
   *
   * @param value The value to be written, either as a plain string or a FormControlState
   */
  public override writeValue(value: string | FormControlState<string>): void {
    const actualValue =
      typeof value === 'object' && value !== null && 'value' in value ? (value.value ?? '') : (value ?? '');
    this.selectedValue = actualValue;
    this.updateCheck();
  }

  /**
   * Handles the change event from the radio input.
   * Updates the selected value and propagates changes to the form control.
   *
   * @param event The change event from the input
   */
  public updateValue(event: Event): void {
    const isSelected = (event.target as HTMLInputElement).checked;
    this.isSelected = isSelected;
    const newValue = (event.target as HTMLInputElement).value;
    this.selectedValue = newValue;
    this.control?.setValue(newValue);
    if (!this.formControlName() && this.name()) {
      this.setValueInStandaloneMode(newValue);
      this.setStatusInStandaloneMode('markAsDirty');
    }
    this.changeSelected.emit(isSelected);
  }

  /**
   * Sets this radio button as selected or not.
   *
   * @param checked Whether the radio should be selected
   */
  public setSelected(checked: boolean): void {
    if (this.control) {
      this.isSelected = checked;
      this.control?.setValue(checked ? this.value() : null);
    }
  }

  /** Set the focus on focussable element */
  public override focus(): void {
    if (this.elementRef()) {
      this.elementRef()?.nativeElement.focus();
    }
  }

  /**
   * Set the focus on focussable element when there is an error
   */
  public override focusError(): void {
    this.focus();
  }

  /**
   * Handles blur event to determine if focus left the entire radio group.
   * If so, marks the control as touched.
   *
   * @param event The blur event from the input
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
      const currentGroupId = currentElement?.dataset['radioGroup'];
      const previousElement = this.focusEvent?.target as HTMLElement;
      RfRadioComponent.previosGroupId = previousElement?.dataset['radioGroup'] ?? null;
      if (currentGroupId !== RfRadioComponent.previosGroupId) {
        this.control?.markAsTouched();
        this.onTouched();
        this.changeDetector.markForCheck();
      }
    });
  }

  /**
   * Registers event listeners for standalone form control behaviors
   * like touched, dirty, pristine, enable, disable.
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
    (this.control as RfFormControl)?.onMarkAllAsDirty.subscribe(() => {
      this.setStatusInStandaloneMode('markAllAsDirty');
    });
    (this.control as RfFormControl)?.onMarkAsUntouched.subscribe(() => {
      this.setStatusInStandaloneMode('markAsUntouched');
    });
    (this.control as RfFormControl)?.onMarkAsDirty.subscribe(() => {
      this.setStatusInStandaloneMode('markAsDirty');
    });
    (this.control as RfFormControl)?.onMarkAsPristine.subscribe(() => {
      this.setStatusInStandaloneMode('markAsPristine');
    });
  }

  /**
   * Executes layout-dependent logic after view rendering.
   * Assigns first/last status, syncs error messages, validators and values.
   */
  private actionsAfterRender(): void {
    requestAnimationFrame(() => {
      if (!RfRadioComponent.ariaIds[this.radioFormName]) {
        RfRadioComponent.ariaIds[this.radioFormName] = this.randomId;
      }
      this.ariaId.set(RfRadioComponent.ariaIds[this.radioFormName]);
      if (!RfRadioComponent.radioValueRegistered[this.radioFormName]) {
        this.isFirstRadioInGroup.set(true);
      }
      RfRadioComponent.radioValueRegistered[this.radioFormName] = this.value();
      if (RfRadioComponent.radioValues[this.radioFormName] === this.value()) {
        this.isLastRadioInGroup.set(true);
      }
      if (this.isLastRadioInGroup()) {
        this.errorMessages.set(RfRadioComponent.errorMessages[this.radioFormName]);
      }
      this.handleSendEvents();
      if (!this.formControlName()) {
        this.setValueInStandaloneMode(RfRadioComponent.radioChecked[this.radioFormName] ?? '');
        this.setValidatorsInStandaloneMode();
        this.setStatusInStandaloneMode(RfRadioComponent.disabled[this.radioFormName] ? 'disable' : 'enable');
      }
    });
  }

  /**
   * Manually sets the selected value for the group in standalone mode.
   *
   * @param value The selected value to set
   */
  private setValueInStandaloneMode(value: string): void {
    const group = RfRadioComponent.controls[this.radioFormName] || [];
    for (const radio of group) {
      radio.control?.setValue(value);
    }
  }

  /**
   * Applies validators to all radios in a standalone group.
   */
  private setValidatorsInStandaloneMode(): void {
    const validatorsConfig: RfValidatorsConfig = RfRadioComponent.validators[this.radioFormName];
    const group = RfRadioComponent.controls[this.radioFormName] || [];
    for (const radio of group) {
      if (typeof validatorsConfig === 'function' || (Array.isArray(validatorsConfig) && validatorsConfig.length > 0)) {
        radio.control?.setValidators(validatorsConfig);
      }
      (radio.control as RfFormControl)?.setCustomValidators(validatorsConfig);
      radio.control?.updateValueAndValidity();
    }
  }

  /**
   * Executes a control status method like 'markAsTouched' or 'disable' across the group.
   *
   * @param action The name of the method to invoke
   */
  private setStatusInStandaloneMode(action: string): void {
    const radios = RfRadioComponent.controls[this.radioFormName] || [];
    for (const radio of radios) {
      const control = radio.control;
      if (control instanceof RfFormControl && typeof control[action as keyof RfFormControl] === 'function') {
        (control[action as keyof RfFormControl] as Function).call(control, { emitEvent: false });
        this.changeDetector.markForCheck();
      }
    }
  }

  /**
   * Updates the `checked` binding based on the current selected value.
   */
  private updateCheck(): void {
    this.checked.set(this.selectedValue === this.value());
  }

  /**
   * Listens for external `setValue` calls and synchronizes the radio group state.
   */
  private handleSendEvents(): void {
    (this.control as RfFormControl)?.onSetValue.subscribe((value) => {
      this.formControlName() ? this.propagateStatusInRf(value) : this.propagateStatusInStandalone(value);
    });
  }

  /**
   * Updates native input element in reactive form mode based on selected value.
   *
   * @param value The selected value to apply
   */
  private propagateStatusInRf(value: string): void {
    this.isSelected = value === this.value();
    (this.elementRef()?.nativeElement as HTMLInputElement).checked = value === this.value();
  }

  /**
   * Propagates the selected value across all radios in standalone mode.
   *
   * @param value The selected value to apply
   */
  private propagateStatusInStandalone(value: string): void {
    for (const component of RfRadioComponent.controls[this.name()] ?? []) {
      const isSelected: boolean = value === component.value();
      component.control?.setValue(value, { emitEvent: false });
      component.isSelected = isSelected;
      (component.elementRef()?.nativeElement as HTMLInputElement).checked = isSelected;
    }
  }
}
