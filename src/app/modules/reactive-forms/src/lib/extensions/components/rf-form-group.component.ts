import { signal } from '@angular/core';
import { AbstractControl, AsyncValidatorFn, FormArray, FormGroup, ValidatorFn } from '@angular/forms';

import { RfErrorDisplayModes } from '../../abstract/enums/rf-base-reactive-display-mode.enum';

import { RfFormControl } from './rf-form-control.component';

/**
 * `RfFormGroup` extends Angular's `FormGroup` by:
 * - Tracking the form name and preventing duplicate names (unless explicitly allowed).
 * - Managing a shared `displayErrorsMode` for all contained controls.
 * - Providing recursive methods to mark controls as dirty/touched.
 * - Supporting state propagation for `submitted` and `debug` flags.
 *
 * This utility is especially useful in complex dynamic forms where
 * error handling and state syncing need to be centralized.
 */
export class RfFormGroup extends FormGroup {
  /** The name of this form group (used for identification and tracking). */
  public formName: string;

  /** Error display mode shared across child components. */
  public displayErrorsMode: RfErrorDisplayModes | undefined | null;
  public readonly valueSignal = signal(this.value);
  public readonly statusSignal = signal(this.status);

  /**
   * Static registry to track already used form names and avoid duplication.
   */
  private static readonly registeredFormNames = new Set<string>();

  /**
   * Constructs a new `RfFormGroup`.
   *
   * @param formName - A unique form name or a config object with `name` and `allowRepeat`.
   * @param controls - The child controls of the form group.
   * @param validators - Optional synchronous validators.
   * @param asyncValidators - Optional asynchronous validators.
   * @param displayErrorsMode - Default error display mode for this form.
   */
  constructor(
    formName: string | { name: string; allowRepeat: boolean },
    controls: { [key: string]: AbstractControl },
    validators?: ValidatorFn | ValidatorFn[] | null,
    asyncValidators?: AsyncValidatorFn | AsyncValidatorFn[] | null,
    displayErrorsMode?: RfErrorDisplayModes | null
  ) {
    const name = typeof formName === 'string' ? formName : formName.name;
    const allowRepeat = typeof formName === 'string' ? false : formName.allowRepeat;

    if (!allowRepeat && RfFormGroup.registeredFormNames.has(name)) {
      console.warn(`Form with name "${name}" already exists.`);
    }

    super(controls, validators, asyncValidators);

    this.formName = name;
    this.displayErrorsMode = displayErrorsMode;

    if (!allowRepeat) {
      RfFormGroup.registeredFormNames.add(name);
    }

    this.valueChanges.subscribe(() => this.valueSignal.set(this.value));
    this.statusChanges.subscribe(() => this.statusSignal.set(this.status));
  }

  /** Tracks whether this form has been submitted. */
  private _submitted = false;

  /**
   * Gets the submitted status of the form.
   */
  public get submitted(): boolean {
    return this._submitted;
  }

  /**
   * Sets the submitted status and propagates it to child controls.
   */
  public set submitted(value: boolean) {
    this._submitted = value;
    this.changeSubmitedStatus();
  }

  /**
   * Marks all controls (and nested controls) as dirty.
   *
   * @param control - The root control to mark. Defaults to `this`.
   */
  public markAllAsDirty(control: AbstractControl = this): void {
    if ((control as RfFormGroup | FormGroup | FormArray).controls) {
      control.markAsDirty();
      const children = (control as RfFormGroup | FormGroup | FormArray).controls;
      for (const child of Object.values(children)) {
        this.markAllAsDirty(child);
      }
    } else {
      (control as RfFormControl).markAllAsDirty();
    }
  }

  /**
   * Updates the `displayErrorsMode` for all controls that support it.
   *
   * @param errorMode - The error display mode to apply.
   */
  public changeDisplayErrorsMode(errorMode: RfErrorDisplayModes): void {
    this.displayErrorsMode = errorMode;
    this.changeDisplayErrorsModeInternal(this.controls, errorMode);
  }

  /**
   * Internal recursive helper that applies a given `displayErrorsMode`
   * to all `RfFormControl` children and their nested forms.
   *
   * @param controls - The controls to process.
   * @param errorMode - The error display mode to apply.
   */
  private changeDisplayErrorsModeInternal(
    controls: { [key: string]: AbstractControl },
    errorMode: RfErrorDisplayModes
  ): void {
    for (const control of Object.values(controls ?? {})) {
      if (
        control instanceof RfFormControl &&
        'rfComponent' in control &&
        control.rfComponent &&
        typeof control.rfComponent === 'object'
      ) {
        const components = Array.isArray(control.rfComponent) ? control.rfComponent : [control.rfComponent];
        for (const component of components) {
          component.displayErrorsMode.set(errorMode);
        }
        if ((control.rfComponent as any).form) {
          this.changeDisplayErrorsModeInternal((control.rfComponent as any).form.controls, errorMode);
        }
      }
    }
  }

  /**
   * Propagates the `submitted` state to all child controls and their components.
   */
  public changeSubmitedStatus(): void {
    this.propagateSubmitedStatus(this.controls);
  }

  /**
   * Internal recursive helper that propagates the current `submitted` state
   * to all `RfFormControl` children and their nested forms.
   *
   * @param controls - The controls to update.
   */
  private propagateSubmitedStatus(controls: { [key: string]: AbstractControl }): void {
    for (const control of Object.values(controls ?? {})) {
      if (
        control instanceof RfFormControl &&
        'rfComponent' in control &&
        control.rfComponent &&
        typeof control.rfComponent === 'object'
      ) {
        control.submitted = this._submitted;
        if ((control.rfComponent as any).form) {
          this.propagateSubmitedStatus((control.rfComponent as any).form.controls);
        }
      }
    }
  }

  /**
   * Enables or disables debug mode for all associated components inside the form.
   *
   * @param isEnabled - Whether to enable or disable debug mode.
   */
  public setDebug(isEnabled: boolean): void {
    for (const control of Object.values(this.controls ?? {})) {
      if (
        control instanceof RfFormControl &&
        'rfComponent' in control &&
        control.rfComponent &&
        typeof control.rfComponent === 'object'
      ) {
        const components = Array.isArray(control.rfComponent) ? control.rfComponent : [control.rfComponent];
        for (const component of components) {
          component.debug = isEnabled;
        }
      }
    }
  }

  /**
   * Marks controls as touched only if they currently hold a value.
   * Useful for triggering validation messages without marking untouched/empty fields.
   */
  public markControlsWithValueAsTouched(): void {
    for (const [, control] of Object.entries(this.controls)) {
      this.markControlIfHasValue(control);
      this.processNestedControls(control);
    }
  }

  /**
   * Focuses the first invalid form control for accessibility and error recovery.
   *
   * - Focus is always moved to the invalid control.
   * - Scrolling only occurs if the control is not visible within the viewport.
   * - Consumers may handle sticky header offsets via `scroll-margin-top`.
   *
   * Intended usage: call after a failed submit/validation.
   */
  public focusFirstInvalidField(): void {
    if (!this?.controls) {
      return;
    }

    const formControls = Object.keys(this.controls);

    for (const key of formControls) {
      const control = this.get(key) as RfFormControl;
      if (control && !control.valid && control.rfComponent) {
        const component = Array.isArray(control.rfComponent) ? control.rfComponent[0] : control.rfComponent;

        if (component) {
          component.focusError();
          requestAnimationFrame(() => {
            const element = component.getElementRef().nativeElement as HTMLElement;
            const rect = element.getBoundingClientRect();

            const SAFE_TOP = 16;
            const SAFE_BOTTOM = window.innerHeight - 16;

            const isAboveViewport = rect.top < SAFE_TOP;
            const isBelowViewport = rect.bottom > SAFE_BOTTOM;

            if (isAboveViewport || isBelowViewport) {
              element.scrollIntoView({ block: 'start', behavior: 'smooth' });
            }
          });
        }
        return;
      }
    }
  }

  /**
   * Marks a control as touched if it has a non-empty value.
   */
  private markControlIfHasValue(control: AbstractControl): void {
    const hasValue = this.hasNonEmptyValue(control.value);
    if (hasValue) {
      control.markAsTouched({ onlySelf: true });
    }
  }

  /**
   * Processes nested FormGroup, RfFormGroup, or FormArray controls recursively.
   */
  private processNestedControls(control: AbstractControl): void {
    if (control instanceof FormGroup || control instanceof RfFormGroup) {
      (control as RfFormGroup).markControlsWithValueAsTouched();
    } else if (control instanceof FormArray) {
      this.processFormArrayControls(control);
    }
  }

  /**
   * Processes all controls within a FormArray.
   */
  private processFormArrayControls(formArray: FormArray): void {
    for (const c of formArray.controls) {
      if (c instanceof FormGroup || c instanceof RfFormGroup) {
        (c as RfFormGroup).markControlsWithValueAsTouched();
      } else if (this.hasNonEmptyValue(c.value)) {
        c.markAsTouched({ onlySelf: true });
      }
    }
  }

  /**
   * Checks if a value is non-empty (not null, undefined, or empty string).
   */
  private hasNonEmptyValue(value: unknown): boolean {
    return value !== null && value !== undefined && value !== '';
  }

  /**
   * Clears a previously registered form name to allow reuse.
   *
   * @param formName - The name to remove from the registry.
   */
  public static clearFormName(formName: string): void {
    RfFormGroup.registeredFormNames.delete(formName);
  }

  /**
   * Clears all registered form names. Useful for tests or form resets.
   */
  public static resetNames(): void {
    RfFormGroup.registeredFormNames.clear();
  }
}
