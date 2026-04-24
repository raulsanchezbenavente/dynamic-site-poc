import {
  AfterContentInit,
  ChangeDetectorRef,
  DestroyRef,
  Directive,
  effect,
  ElementRef,
  EventEmitter,
  inject,
  model,
  Optional,
  SkipSelf,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  ControlContainer,
  ControlValueAccessor,
  FormControl,
  FormGroup,
  ValidationErrors,
  Validator,
  ValidatorFn,
} from '@angular/forms';
import { UserCulture } from '@dcx/ui/libs';

import { MANDATORY_SYMBOL } from '../../common/common.constants';
import { RfErrorMessages } from '../../components/common/rf-error-messages/types/rf-error-messages.types';
import { RfHintMessages } from '../../components/common/rf-hint-messages/types/rf-hint-messages.types';
import { RfFormControl } from '../../extensions/components/rf-form-control.component';
import { RfFormGroup } from '../../extensions/components/rf-form-group.component';
import { RfComponentTypes } from '../../extensions/types/rf-form-control-validations.types';
import { RfValidator } from '../../form-builder/types/rf-form-builder-validator.type';
import { IdService } from '../../services/id/id.service';
import { GlobalEventsService } from '../../services/mouseEvents/mouse-events.service';
import { DEFAULT_SHOW_ERRORS_MODE } from '../constants/rf-default-values.constant';
import { RfAppearanceTypes } from '../enums/rf-base-reactive-appearance.enum';
import { RfErrorDisplayModes } from '../enums/rf-base-reactive-display-mode.enum';
import { RfBaseReactiveClasses } from '../models/rf-base-reactive-classes.model';

/**
 * Abstract base class for reactive form components.
 * Handles integration with Angular Reactive Forms and common logic for control initialization,
 * value access, validation, appearance configuration, and error display modes.
 *
 * @template Value - The type of the value handled by the component.
 * @template HintMessages - The structure of the hint messages.
 * @template ErrorMessages - The structure of the error messages.
 * @template Classes - The class configuration used for styling.
 * @template AriaIds - The ARIA identifiers type, used for accessibility.
 */
@Directive()
export abstract class RfBaseReactiveComponent<
    Value = unknown,
    HintMessages = RfHintMessages,
    ErrorMessages = RfErrorMessages,
    Classes = RfBaseReactiveClasses,
    AriaIds = string | Record<string, string>,
  >
  implements ControlValueAccessor, Validator, AfterContentInit
{
  /** Unique ID generator service */
  public idService = inject(IdService);
  private readonly globalEventsService = inject(GlobalEventsService);
  public mouseDownIsInProgress: boolean = false;
  public actionBlurIsPending: boolean = false;
  private isUsingTabNavigation = false;

  /** The value of the component */
  public value = model<Value>();
  /** List of validators applied to the component */
  public validators = model<RfValidator>();
  /** Whether the component is disabled */
  public disabled = model<boolean>(false);
  /** Determines when validation errors are displayed */
  public displayErrorsMode = model<RfErrorDisplayModes>(RfErrorDisplayModes.NONE);
  /** ARIA ID for the error container */
  public ariaId = model<string | null>('');
  /** Visual appearance of the component */
  public appearance = model<RfAppearanceTypes>(RfAppearanceTypes.DEFAULT);
  /** Whether the component is readonly */
  public readonly = model<boolean>(false);
  /** Whether to show validations */
  public showValidations = model<boolean>(true);
  /** Whether to show hint messages */
  public showHintMessages = model<boolean>(true);
  /** Whether to show error messages */
  public showErrorMessages = model<boolean>(true);
  /** Name of the form control (used for ControlContainer binding) */
  public formControlName = model<string>();
  /** Custom hint messages for the control */
  public hintMessages = model<HintMessages>();
  /** Custom error messages for the control */
  public errorMessages = model<ErrorMessages>();
  /** Class configuration for styling */
  public classes = model<Classes>();
  /** User culture settings (e.g., locale) */
  public culture = model<UserCulture>();
  /** ARIA labelled-by configuration */
  public ariaLabelledBy = model<AriaIds>();
  /** Debug mode toggle */
  public hideDebug = model<boolean>(false);

  /** The underlying AbstractControl */
  public control!: AbstractControl | null;
  /** Parent form group */
  public parentForm!: FormGroup | RfFormGroup | null;
  /** Whether the control is required */
  public isRequired: boolean = false;
  /** Random unique identifier */
  public randomId: string = this.idService.generateRandomId();
  /** Type class of the component, used internally */
  public rfTypeClass: string = '';
  /** Available appearance types enum */
  public appearanceTypes = RfAppearanceTypes;
  /** Title element ID used for accessibility */
  public titleId: string = this.idService.generateRandomId();
  /** ID used for automation from parent */
  public parentAutoId = model<string>('');
  /** ID used for automation */
  public autoId: string = '';
  /** Optional parent ID used for generating element IDs */
  public parentId = model<string | null>(null);
  /** Declares the mandatory simbol */
  public MANDATORY_SYMBOL = MANDATORY_SYMBOL;
  /** Debug flag (internal) */
  public debug: boolean = false;

  /** Callback for value changes */
  public onChange: (value: Value) => void = () => {};
  /** Callback for touched state */
  public onTouched: () => void = () => {};
  /** Callback for dirty state */
  public onDirty: () => void = () => {};
  /** Emits when the disabled state changes */
  public onChangeDisabledState = new EventEmitter<boolean>();

  /** Whether the form has been submitted */
  public get submitted(): boolean {
    return (this.control as RfFormControl).submitted;
  }
  public set submitted(value: boolean) {
    (this.control as RfFormControl).submitted = value;
  }

  /** Change detector reference */
  public changeDetector = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  constructor(@Optional() @SkipSelf() private readonly controlContainer?: ControlContainer) {
    this.globalEventsService.mousedown$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.mouseDownIsInProgress = true;
      if (this.isUsingTabNavigation) {
        this.isUsingTabNavigation = false;
      }
    });

    this.globalEventsService.mouseup$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      if (this.actionBlurIsPending) {
        this.executeActionBlur();
        this.actionBlurIsPending = false;
      }
      this.mouseDownIsInProgress = false;
    });

    this.globalEventsService.keydown$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((event: KeyboardEvent) => {
      if (event.key === 'Tab' && !this.isUsingTabNavigation) {
        this.isUsingTabNavigation = true;
      }
    });
  }

  public abstract executeActionBlur(): void;

  /** Registers an effect to update disabled state when `disabled` changes */
  private readonly registerDisabledEffect = effect(() => {
    if (this.control) {
      if (this.disabled()) {
        this.control.disable({ emitEvent: false });
      } else {
        this.control.enable({ emitEvent: false });
      }
    }
    this.onChangeDisabledState.emit(this.disabled());
  });

  /** Generates automation id regarding the component */
  public generateAutoId(parentId?: string | null): string {
    const base = parentId ?? this.getFormName();
    const prefix = base ? `${base}__` : '';
    const controlName = this.formControlName() ?? '';
    const valueSuffix = ['RfRadioComponent', 'RfCheckboxComponent'].includes(this.rfTypeClass)
      ? `||${this.value()}`
      : '';
    return 'RfFormGroup-' + prefix + this.getComponentForId() + '-' + controlName + valueSuffix;
  }

  /** Generates custom id for combined components */
  public getCustomAutoId(): string {
    return (
      (this.getFormName() ? this.getFormName() + '__' : '') +
      (this.getComponentForId() + '-') +
      (this.formControlName() ? this.formControlName() : '')
    );
  }

  /** Returns component name for automation id */
  public getComponentForId(): string {
    return this.rfTypeClass.replace(/Component/, '');
  }

  /** Angular lifecycle hook: initializes the control after content is set */
  public ngAfterContentInit(): void {
    this.initControl();
    this.ariaId.set(this.randomId);
  }

  /** Writes a value from the form model into the view */
  public writeValue(value: Value): void {
    this.value.set(value);
    this.onValueChange(value);
  }

  /** Registers a callback to be triggered when the control's value changes */
  public registerOnChange(fn: (value: Value) => void): void {
    this.onChange = fn;
  }

  /** Registers a callback to be triggered when the control is touched */
  public registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  /** Registers a callback for when the control becomes dirty */
  public registerOnDirty(fn: () => void): void {
    this.onDirty = fn;
  }

  /** Updates the component's disabled state */
  public setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  /** Associates the component with a form control */
  public validate(control: AbstractControl): ValidationErrors | null {
    this.control = control;
    return null;
  }

  /** Returns the name of the parent form (if any) */
  public getFormName(): string {
    const formGroup = this.getParentFormGroup();
    if (formGroup instanceof RfFormGroup) {
      return formGroup.formName;
    }
    return '';
  }

  /** Returns the form control instance */
  public getFormControl(): FormControl | RfFormControl | null {
    return this.control instanceof FormControl ? (this.control as FormControl | RfFormControl) : null;
  }

  /** Returns the parent form group */
  public getParentFormGroup(): FormGroup | RfFormGroup | null {
    return this.parentForm;
  }

  /** Returns the full name of the form control (including form name prefix) */
  public getFullFormControlName(): string {
    const formName = this.getFormName()?.trim();
    const controlName = this.formControlName() ? this.formControlName()?.trim() : this.randomId;
    if (!controlName) {
      return '';
    }
    return formName ? `${formName}-${controlName}` : controlName;
  }

  /** Retrieves the display error mode from the form group */
  public getDisplayErrorsModeFromFormGroup(): RfErrorDisplayModes {
    const formGroup = this.getParentFormGroup();
    if (formGroup instanceof RfFormGroup) {
      return formGroup.displayErrorsMode ?? DEFAULT_SHOW_ERRORS_MODE;
    }
    return DEFAULT_SHOW_ERRORS_MODE;
  }

  /** Determines if errors should be shown for a control given a display mode */
  public showErrorsAccordingDisplayConfig(
    control: AbstractControl | null,
    displayErrorsMode: RfErrorDisplayModes | undefined
  ): boolean {
    return RfBaseReactiveComponent.showErrorsAccordingDisplayConfig(control, displayErrorsMode);
  }

  /** Registers events to track form state changes */
  public registerStateFormEvents(control: RfFormControl, form: RfFormGroup): void {
    control.onMarkAsTouched.subscribe(() => form.markAsTouched());
    control.onMarkAllAsTouched.subscribe(() => form.markAllAsTouched());
    control.onMarkAsUntouched.subscribe(() => form.markAsUntouched());
    control.onMarkAllAsDirty.subscribe(() => form.markAllAsDirty());
    control.onMarkAsDirty.subscribe(() => form.markAsDirty());
    control.onMarkAsPristine.subscribe(() => form.markAsPristine());
  }

  /** Set the focus on focussable element. Override in each component */
  public abstract focus(): void;

  public abstract focusError(): void;

  public abstract getElementRef(): ElementRef;

  /** Internal method triggered when value changes */
  protected onValueChange(value: Value): void {
    this.onChange(value);
  }

  /** Creates a standalone form control instance */
  protected standaloneControlCreation(): void {
    this.control ??= new RfFormControl(this.value(), this.validators() as ValidatorFn[]);
  }

  /** Recursively collects validation errors from the form group */
  protected getAllFormErrors(form: RfFormGroup): Record<string, ValidationErrors> {
    const errors: Record<string, ValidationErrors> = {};
    for (const key of Object.keys(form.controls)) {
      const control = form.get(key);
      if (control instanceof RfFormGroup) {
        const childErrors = this.getAllFormErrors(control);
        for (const childKey of Object.keys(childErrors)) {
          errors[`${key}.${childKey}`] = childErrors[childKey];
        }
      } else if (control?.errors) {
        errors[key] = control.errors;
      }
    }
    return errors;
  }

  /** Whether the error messages should be shown according to config */
  public get errorMessagesShouldBeDisplayed(): boolean {
    return this._errorMessagesShouldBeDisplayed();
  }

  /** Internal logic for error message visibility */
  // eslint-disable-next-line @typescript-eslint/naming-convention
  private _errorMessagesShouldBeDisplayed(): boolean {
    if (this.disabled() || this.readonly()) {
      return false;
    } else {
      return (
        (this.showValidations() &&
          this.control?.errors &&
          RfBaseReactiveComponent.showErrorsAccordingDisplayConfig(this.control, this.displayErrorsMode())) ||
        false
      );
    }
  }

  /** Initializes the form control with validation and parent linkage */
  private initControl(): void {
    if (!this.control && this.controlContainer) {
      this.control = this.controlContainer.control as RfFormControl;
    }

    if ((this.control instanceof FormGroup || this.control instanceof RfFormGroup) && this.formControlName()) {
      this.control = this.control.get(this.formControlName()!);
    }

    this.parentForm = this.control?.parent as FormGroup | RfFormGroup;

    if (!this.displayErrorsMode() || this.displayErrorsMode() === RfErrorDisplayModes.NONE) {
      this.displayErrorsMode.set(this.getDisplayErrorsModeFromFormGroup() || DEFAULT_SHOW_ERRORS_MODE);
    }

    this.standaloneControlCreation();

    if (this.control && (this.control as RfFormControl)) {
      const control: RfFormControl = this.control as RfFormControl;
      const rfComponent: RfComponentTypes = this as unknown as RfComponentTypes;

      if (['RfRadioComponent', 'RfCheckboxComponent'].includes(rfComponent.rfTypeClass)) {
        if (!Array.isArray(control.rfComponent)) {
          control.rfComponent = [];
        }
        control.rfComponent.push(rfComponent);
      } else {
        control.rfComponent = rfComponent;
      }
    }
    this.isRequired = (this.control as RfFormControl)?.isRequired;
  }

  /** Forces change detection when form events are triggered */
  protected forceMarkEvents(): void {
    const control = this.control as RfFormControl;
    const observables = [
      control.onMarkAllAsTouched,
      control.onMarkAsTouched,
      control.onMarkAsUntouched,
      control.onMarkAsDirty,
      control.onMarkAsPristine,
    ];
    for (const obs of observables) {
      obs?.subscribe(() => this.changeDetector.markForCheck());
    }
  }

  /** Static utility to determine if errors should be shown based on mode */
  public static showErrorsAccordingDisplayConfig(
    control: AbstractControl | null,
    displayErrorsMode: RfErrorDisplayModes | undefined
  ): boolean {
    switch (displayErrorsMode) {
      case RfErrorDisplayModes.ALWAYS:
        return true;
      case RfErrorDisplayModes.NEVER:
        return false;
      case RfErrorDisplayModes.DIRTY:
        return control?.dirty || false;
      case RfErrorDisplayModes.TOUCHED:
        return control?.touched || false;
      case RfErrorDisplayModes.DIRTY_AND_TOUCHED:
        return (control?.dirty && control?.touched) || false;
      case RfErrorDisplayModes.SUBMITTED:
        return (control as RfFormControl)?.submitted;
      default:
        return false;
    }
  }

  /**
   * Restrict keyboard actions when readonly or disabled, except for Tab key.
   */
  public restrictKeyboardActions(event: KeyboardEvent): void {
    if ((this.readonly() || this.disabled()) && event.key !== 'Tab') {
      event.preventDefault();
    }
  }
}
