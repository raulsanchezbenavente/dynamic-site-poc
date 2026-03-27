import { Component, Input } from '@angular/core';
import type { AbstractControl } from '@angular/forms';

import type { RfErrorDisplayModes } from '../../../../../../lib/abstract/enums/rf-base-reactive-display-mode.enum';

/**
 * Dummy component to expose `RfFormGroup` API for Storybook autodocs.
 * This component mimics the public API of the real class, with empty methods and annotated properties.
 */
@Component({
  selector: 'form-group-fake',
  template: '',
})
export class FormGroupFakeComponent {
  /** The name of this form group (used for identification and tracking). */
  @Input() public formName: string = '';

  /** Error display mode shared across child components. */
  @Input() public displayErrorsMode: RfErrorDisplayModes | undefined | null = null;

  /** Tracks whether this form has been submitted. */
  private _submitted = false;

  /**
   * Gets the submitted status of the form.
   */
  @Input()
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
  public markAllAsDirty(control: AbstractControl = {} as AbstractControl): void {}

  /**
   * Updates the `displayErrorsMode` for all controls that support it.
   *
   * @param errorMode - The error display mode to apply.
   */
  public changeDisplayErrorsMode(errorMode: RfErrorDisplayModes): void {}

  /**
   * Propagates the `submitted` state to all child controls and their components.
   */
  public changeSubmitedStatus(): void {}

  /**
   * Enables or disables debug mode for all associated components inside the form.
   *
   * @param isEnabled - Whether to enable or disable debug mode.
   */
  public setDebug(isEnabled: boolean): void {}

  /**
   * Marks controls as touched only if they currently hold a value.
   * Useful for triggering validation messages without marking untouched/empty fields.
   */
  public markControlsWithValueAsTouched(): void {}

  /**
   * Clears a previously registered form name to allow reuse.
   *
   * @param formName - The name to remove from the registry.
   */
  public static clearFormName(formName: string): void {}

  /**
   * Clears all registered form names. Useful for tests or form resets.
   */
  public static resetNames(): void {}

  /**
   * Internal recursive helper that applies a given `displayErrorsMode`
   * to all `RfFormControl` children and their nested forms.
   *
   * @param controls - The controls to process.
   * @param errorMode - The error display mode to apply.
   */
  private _changeDisplayErrorsMode(
    controls: { [key: string]: AbstractControl },
    errorMode: RfErrorDisplayModes
  ): void {}

  /**
   * Internal recursive helper that propagates the current `submitted` state
   * to all `RfFormControl` children and their nested forms.
   *
   * @param controls - The controls to update.
   */
  private _changeSubmitedStatus(controls: { [key: string]: AbstractControl }): void {}

  /**
   * Static registry to track already used form names and avoid duplication.
   */
  private static registeredFormNames = new Set<string>();
}
