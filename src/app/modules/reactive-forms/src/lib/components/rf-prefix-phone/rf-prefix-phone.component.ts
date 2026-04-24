/* eslint-disable @typescript-eslint/no-unused-expressions */
import { NgClass } from '@angular/common';
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
import {
  AfterContentInit,
  AfterViewInit,
  Component,
  ElementRef,
  forwardRef,
  HostBinding,
  input,
  model,
  OnInit,
  output,
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
import { SafeHtml } from '@angular/platform-browser';
import { debounceTime, noop } from 'rxjs';

import { RfBaseReactiveComponent } from '../../abstract/components/rf-base-reactive.component';
import { RfErrorDisplayModes } from '../../abstract/enums/rf-base-reactive-display-mode.enum';
import { RfFormControl } from '../../extensions/components/rf-form-control.component';
import { RfFormGroup } from '../../extensions/components/rf-form-group.component';
import { RfDebugStateComponent } from '../common/rf-debug-state/rf-debug-state.component';
import { RfErrorMessagesComponent } from '../common/rf-error-messages/rf-error-messages.component';
import { RfHintMessagesComponent } from '../common/rf-hint-messages/rf-hint-messages.component';
import { AutocompleteTypes } from '../rf-input-text/enums/rf-autocomplete-types.enum';
import { RfInputTextComponent } from '../rf-input-text/rf-input-text.component';
import { RfListOption } from '../rf-list/models/rf-list-option.model';
import { RfSelectComponent } from '../rf-select/rf-select.component';

import { RfPrefixPhoneAria } from './models/rf-prefix-phone-aria.model';
import { RfPrefixPhoneClases } from './models/rf-prefix-phone-classes.model';
import { RfPrefixPhoneErrorMessages } from './models/rf-prefix-phone-error-messages.model';
import { RfPrefixPhoneForm } from './models/rf-prefix-phone-form.model';
import { RfPrefixPhoneHintMessages } from './models/rf-prefix-phone-hint-messages.model';
import { RfPrefixPhoneValidators } from './models/rf-prefix-phone-validators.model';
import { RfPrefixPhoneValue } from './models/rf-prefix-phone-value.model';

/**
 * `RfPrefixPhoneComponent` is a combined input component that allows users to select a phone prefix
 * from a dropdown list and enter the corresponding phone number.
 *
 * It extends `RfBaseReactiveComponent` to support reactive forms, custom validation,
 * and form control state management. Internally, it manages its own `RfFormGroup` containing
 * both `prefix` and `phone` fields.
 *
 * Selector: `rf-prefix-phone`
 *
 * Usage scenarios include phone number entry with country code selection,
 * internationalization, and form validation.
 */
@Component({
  selector: 'rf-prefix-phone',
  templateUrl: './rf-prefix-phone.component.html',
  styleUrl: './styles/rf-prefix-phone.styles.scss',
  host: { class: 'rf-prefix-phone' },
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RfPrefixPhoneComponent),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => RfPrefixPhoneComponent),
      multi: true,
    },
  ],
  imports: [
    NgClass,
    ReactiveFormsModule,
    FormsModule,
    RfSelectComponent,
    RfInputTextComponent,
    RfErrorMessagesComponent,
    RfHintMessagesComponent,
    RfDebugStateComponent,
  ],
})
export class RfPrefixPhoneComponent
  extends RfBaseReactiveComponent<
    RfPrefixPhoneValue | FormControlState<RfPrefixPhoneValue>,
    RfPrefixPhoneHintMessages,
    RfPrefixPhoneErrorMessages,
    RfPrefixPhoneClases,
    RfPrefixPhoneAria
  >
  implements OnInit, AfterViewInit, AfterContentInit
{
  /** Emits event when the input gets a paste action */
  public pasteInputText = output<ClipboardEvent>();
  /** Emits event when the input gets a dragleave action */
  public dragleaveInputText = output<DragEvent>();
  /** Reference to the first select */
  public readonly firstControl = viewChild<RfSelectComponent>('firstControl');
  /** Dropdown list options for phone prefixes (e.g., countries or regions). */
  public options = model<RfListOption[]>([]);
  /** Title shown above or beside the input group. */
  public title = model<string>('');
  public phoneName = input.required<string>();
  /** Placeholder text for the prefix select component. */
  public placeholderPrefix = input<string>('');
  /** Placeholder text for the phone input component. */
  public placeholderPhone = input<string>('');
  /** Floating label for the prefix select component. */
  public animatedLabelPrefix = model<string>('');
  /** Floating label for the phone input component. */
  public animatedLabelPhone = model<string>('');
  /** Maximum allowed length for the phone number input. */
  public maxLength = model<number>();
  /** Minimum allowed length for the phone number input. */
  public minLength = model<number>();
  /** Autocomplete attribute for the phone input component. */
  public autocompletePhone = input.required<AutocompleteTypes>();
  /** If true, enables typeahead includes instead startwith */
  public typeaheadIncludes = input<boolean>(false);
  /** Optional regex pattern to validate the phone number input. */
  public inputPatternPhone = input<RegExp>();
  /** If true, validation errors for prefix and phone fields are shown separately. */
  public separatedErrors = input<boolean>(false);
  /** Internal reactive form group that contains both prefix and phone controls. */
  public form!: RfFormGroup;
  /** Function to modify the selected option. */
  public mask = input<((data: SafeHtml) => SafeHtml) | undefined>(undefined);
  /** Whether the input group is currently disabled. */
  public isDisabled = false;
  /** Unique ID suffix used to distinguish internal form groups. */
  public groupSuffix: string = this.idService.generateRandomId();
  /** Combined error ARIA ID for accessibility. */
  public ariaIdCombined: string = '';
  /** Type name used for debugging and styling purposes. */
  public override rfTypeClass: string = 'RfPrefixPhoneComponent';
  /** Id for select prefix */
  public autoIdPrefix: string = '';
  /** Id form input phone */
  public autoIdPhone: string = '';

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
   * Host binding that applies container-specific CSS classes dynamically.
   * Uses `classes().container` if defined.
   */
  @HostBinding('class') get hostClasses(): string {
    return this.classes()?.container ?? '';
  }

  /**
   * Angular lifecycle hook.
   * Initializes the internal form group and subscribes to its value changes.
   * Propagates changes to the external form control and updates validation state.
   */
  public ngOnInit(): void {
    this.form = new RfFormGroup('formGropPrefixPhone' + this.groupSuffix, {
      prefix: new RfFormControl({ value: '', disabled: this.isDisabled }),
      phone: new RfFormControl({ value: '', disabled: this.isDisabled }),
    });

    this.form.valueChanges.subscribe((value: RfPrefixPhoneForm) => {
      if (!this.formControlName()) {
        this.control?.setValue(value, { emitEvent: false });
      }
      this.onChange(value);

      this.form.get('phone')?.updateValueAndValidity({ emitEvent: false });

      if (this.form?.valid) {
        this.control?.setErrors(null);
      } else {
        this.control?.setErrors(this.getAllFormErrors(this.form));
      }

      this.updateErrorMessagesWithValidatorLengths();
    });

    this.form
      .get('phone')
      ?.statusChanges.pipe(debounceTime(50))
      .subscribe(() => {
        this.updateErrorMessagesWithValidatorLengths();
      });

    (this.form.get('prefix') as RfFormControl).onMarkAsTouched.subscribe(() => {
      this.control?.markAsTouched();
    });
    (this.form.get('phone') as RfFormControl).onMarkAsTouched.subscribe(() => {
      this.control?.markAsTouched();
    });
    (this.form.get('prefix') as RfFormControl).onMarkAsDirty.subscribe(() => {
      this.control?.markAsDirty({ emitEvent: false });
    });
    (this.form.get('phone') as RfFormControl).onMarkAsDirty.subscribe(() => {
      this.control?.markAsDirty({ emitEvent: false });
    });
  }

  public override getElementRef(): ElementRef {
    return this.firstControl()!.getElementRef();
  }

  /**
   * Angular lifecycle hook.
   * Called after projected content has been initialized.
   * Applies the initial value and disabled state if the component is used standalone.
   */
  public override ngAfterContentInit(): void {
    super.ngAfterContentInit();
    if (!this.formControlName()) {
      if (this.value()) {
        this.form?.setValue(this.value() as RfPrefixPhoneValue, { emitEvent: false });
      }
      this.disabled() ? this.form?.disable() : this.form?.enable();
      this.disabled() ? this.control?.disable() : this.control?.enable();
    }

    (this.form.get('prefix') as RfFormControl).isRequired = this.isRequired;
    (this.form.get('phone') as RfFormControl).isRequired = this.isRequired;
  }

  /**
   * Angular lifecycle hook.
   * Called after the view has been initialized.
   * Assigns validators, registers internal form events, and listens for disabled state changes.
   */
  public ngAfterViewInit(): void {
    const validators: RfPrefixPhoneValidators = (
      this.getFormControl() as RfFormControl
    )?.getCustomValidators() as RfPrefixPhoneValidators;
    this.setValidatorsToForm(validators.prefix, validators.phone);
    this.registerStateFormEvents(this.getFormControl() as RfFormControl, this.form);

    if (!this.formControlName()) {
      this.onChangeDisabledState.subscribe((isDisabled: boolean) => {
        isDisabled ? this.form?.disable() : this.form?.enable();
        isDisabled ? this.control?.disable() : this.control?.enable();
      });
      this.control?.statusChanges.subscribe(() => {
        this.control?.enabled ? this.form?.enable({ emitEvent: false }) : this.form?.disable({ emitEvent: false });
      });
    }

    (this.control as RfFormControl)?.onMarkAllAsDirty.subscribe(() => {
      this.form.get('prefix')?.markAsDirty({ emitEvent: false });
      this.form.get('phone')?.markAsDirty({ emitEvent: false });
    });

    this.ariaIdCombined = this.randomId;

    this.autoIdPrefix = this.getCustomAutoId();
    this.autoIdPhone = this.getCustomAutoId();
  }

  /**
   * Called by Angular to write a new value to the component.
   * Also applies the value to the internal form and updates the disabled state.
   *
   * @param value The value to write to the component, can be raw or wrapped in a `FormControlState`.
   */
  public override writeValue(value: RfPrefixPhoneValue | FormControlState<RfPrefixPhoneValue>): void {
    if (!value) {
      value = { prefix: '', phone: '' };
    }
    const actualValue = this.isFormControlState(value) ? value.value : value;
    this.value.set(actualValue);
    this.form?.setValue(actualValue, { emitEvent: false });
    this.updateDisabledState();
  }

  /**
   * Called by Angular forms to update the disabled/enabled state.
   * Propagates the state to all child controls in the internal form.
   *
   * @param isDisabled Whether the component should be disabled.
   */
  public override setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
    this.updateDisabledState();
  }

  /**
   * Called by Angular forms to perform validation.
   * Returns a `ValidationErrors` object if the internal form is invalid.
   *
   * @param control Optional control instance (not used).
   * @returns `null` if valid, or a `ValidationErrors` object otherwise.
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
   * Creates the internal form control if the component is used standalone.
   * Applies the initial value and validators.
   */
  protected override standaloneControlCreation(): void {
    this.control ??= new RfFormControl(this.value(), this.validators() as RfPrefixPhoneValidators);
  }

  public onPaste(event: ClipboardEvent): void {
    this.pasteInputText.emit(event);
  }

  public onDragleave(event: DragEvent): void {
    this.dragleaveInputText.emit(event);
  }

  /**
   * Enables or disables all inner form controls based on the current `isDisabled` state.
   * Also updates control validity.
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
   * Assigns individual validators to the `prefix` and `phone` controls.
   * Updates their validity and also applies validators to the internal `list` control
   * inside the `RfSelectComponent`.
   *
   * @param validatorsPrefix List of validators for the prefix field.
   * @param validatorsPhone List of validators for the phone field.
   */
  private setValidatorsToForm(validatorsPrefix: ValidatorFn[], validatorsPhone: ValidatorFn[]): void {
    this.form.get('prefix')?.addValidators(validatorsPrefix);
    this.form.get('phone')?.addValidators(validatorsPhone);
    this.form.get('prefix')?.updateValueAndValidity();
    this.form.get('phone')?.updateValueAndValidity();
    ((this.form.get('prefix') as RfFormControl).rfComponent as RfSelectComponent).form
      ?.get('list')
      ?.addValidators(validatorsPrefix);
    ((this.form.get('prefix') as RfFormControl).rfComponent as RfSelectComponent).form
      ?.get('list')
      ?.updateValueAndValidity();
    this.form.markAsPristine();
    this.control?.markAsUntouched();
    this.control?.markAsPristine();
  }

  /**
   * Type guard that determines whether a value is a `FormControlState`.
   *
   * @param value The value to check.
   * @returns True if the value is a `FormControlState`, false otherwise.
   */
  private isFormControlState(value: any): value is FormControlState<RfPrefixPhoneValue> {
    return value && typeof value === 'object' && 'value' in value;
  }

  /**
   * Updates error messages by replacing placeholders with actual requiredLength values
   * from the validator errors. Supports both placeholder format ({{maxlength}}) and numeric format.
   * This allows dynamic error messages based on the current prefix length.
   */
  private updateErrorMessagesWithValidatorLengths(): void {
    const phoneControl = this.form.get('phone');
    const errors = phoneControl?.errors;
    const currentErrorMessages = this.errorMessages();

    if (!errors || !currentErrorMessages?.phone) {
      return;
    }

    let hasChanges = false;
    const phoneMessages = { ...currentErrorMessages.phone };

    if (errors['minlength']?.requiredLength && phoneMessages['minlength']) {
      const requiredLength = errors['minlength'].requiredLength;
      phoneMessages['minlength'] = phoneMessages['minlength']
        .replaceAll(/\{\{minlength\}\}/gi, `${requiredLength}`)
        .replace(/\d+/, `${requiredLength}`);
      hasChanges = true;
    }

    if (errors['maxlength']?.requiredLength && phoneMessages['maxlength']) {
      const requiredLength = errors['maxlength'].requiredLength;
      phoneMessages['maxlength'] = phoneMessages['maxlength']
        .replaceAll(/\{\{maxlength\}\}/gi, `${requiredLength}`)
        .replace(/\d+/, `${requiredLength}`);
      hasChanges = true;
    }

    if (hasChanges) {
      this.errorMessages.set({ ...currentErrorMessages, phone: phoneMessages });
    }
  }

  /**
   * Execute actions when the focus is lost.
   */
  public override executeActionBlur(): void {
    noop();
  }
}
