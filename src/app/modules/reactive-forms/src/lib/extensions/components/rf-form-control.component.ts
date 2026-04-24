import { EventEmitter } from '@angular/core';
import { AsyncValidatorFn, FormControl, ValidatorFn, Validators } from '@angular/forms';

import { Opts } from '../models/rf-form-control-opt.model';
import { RfComponentTypes, RfValidatorsConfig } from '../types/rf-form-control-validations.types';

/**
 * `RfFormControl` extends Angular's `FormControl` by adding:
 * - Emission of custom events on state changes (touched, dirty, value set, etc.).
 * - Storage of custom validators and "required" state.
 * - Support for composite validator configurations (array or object).
 *
 * This control is designed to integrate with advanced reactive form components
 * and enable tighter feedback between components and controls.
 *
 * @template FormState The type of the control's value.
 */
export class RfFormControl<FormState = any> extends FormControl {
  /** Emits when the control is marked as touched. */
  public onMarkAsTouched = new EventEmitter<void>();

  /** Emits when the control and all children are marked as touched. */
  public onMarkAllAsTouched = new EventEmitter<void>();

  /** Emits when the control is marked as untouched. */
  public onMarkAsUntouched = new EventEmitter<void>();

  /** Emits when the control is marked as dirty. */
  public onMarkAsDirty = new EventEmitter<void>();

  /** Emits when the control and all children are marked as dirty. */
  public onMarkAllAsDirty = new EventEmitter<void>();

  /** Emits when the control is marked as pristine. */
  public onMarkAsPristine = new EventEmitter<void>();

  /** Emits when the control's value is updated via `setValue()`. */
  public onSetValue = new EventEmitter<FormState>();

  /** Indicates whether the control is required based on its validator configuration. */
  public isRequired: boolean = false;

  /** Reference to the component(s) associated with this control. */
  public rfComponent!: RfComponentTypes | RfComponentTypes[];

  /** Tracks whether the control has been submitted (for internal form builder use). */
  private _submitted = false;

  /**
   * Gets whether the control has been submitted.
   */
  public get submitted(): boolean {
    return this._submitted;
  }

  /**
   * Sets whether the control has been submitted.
   */
  public set submitted(value: boolean) {
    this._submitted = value;
  }

  /**
   * Stores the custom validators assigned to the control.
   * This can be a single validator, an array, or a composite object,
   * and is used to retrieve or reapply validation logic as needed.
   */
  private customValidators: RfValidatorsConfig = null;

  /**
   * Creates a new instance of RfFormControl.
   *
   * @param formState - Initial control value or FormControlState.
   * @param validators - One or more validators, or a composite validator config object.
   * @param asyncValidator - Optional asynchronous validators.
   */
  constructor(
    formState?: FormState,
    validators?: RfValidatorsConfig,
    asyncValidator?: AsyncValidatorFn | AsyncValidatorFn[] | null
  ) {
    const processedValidators = Array.isArray(validators) ? validators : null;
    super(formState, processedValidators, asyncValidator);
    this.setCustomValidators(validators);
    this.setIfFieldIsRequired(validators);
  }

  /**
   * Sets the internal custom validator configuration.
   *
   * @param validators - Custom validator config.
   */
  public setCustomValidators(validators?: RfValidatorsConfig): void {
    this.customValidators = validators ?? {};
  }

  /**
   * Retrieves the stored custom validator configuration.
   *
   * @returns The custom validator config used by the control.
   */
  public getCustomValidators(): RfValidatorsConfig {
    return this.customValidators;
  }

  /**
   * Sets the control's value and emits the `onSetValue` event
   * if `emitEvent` is not explicitly disabled.
   *
   * @param value - New control value.
   * @param opts - Optional options for `setValue()`.
   */
  public override setValue(value: FormState, opts?: Parameters<FormControl<FormState>['setValue']>[1]): void {
    super.setValue(value, opts);
    if (this.canISendEvent(opts)) {
      this.onSetValue.emit(value);
    }
  }

  /**
   * Marks the control as touched and emits the `onMarkAsTouched` event.
   */
  public override markAsTouched(opts?: Opts): void {
    super.markAsTouched(opts);
    if (this.canISendEvent(opts)) {
      this.onMarkAsTouched.emit();
    }
  }

  /**
   * Marks the control and descendants as touched and emits the corresponding event.
   */
  public override markAllAsTouched(opts?: Opts): void {
    super.markAllAsTouched(opts);
    if (this.canISendEvent(opts)) {
      this.onMarkAllAsTouched.emit();
    }
  }

  /**
   * Marks the control as untouched and emits the `onMarkAsUntouched` event.
   */
  public override markAsUntouched(opts?: Opts): void {
    super.markAsUntouched(opts);
    if (this.canISendEvent(opts)) {
      this.onMarkAsUntouched.emit();
    }
  }

  /**
   * Marks the control as dirty and emits the `onMarkAsDirty` event.
   */
  public override markAsDirty(opts?: Opts): void {
    super.markAsDirty(opts);
    if (this.canISendEvent(opts)) {
      this.onMarkAsDirty.emit();
    }
  }

  /**
   * Marks the control as pristine and emits the `onMarkAsPristine` event.
   */
  public override markAsPristine(opts?: Opts): void {
    super.markAsPristine(opts);
    if (this.canISendEvent(opts)) {
      this.onMarkAsPristine.emit();
    }
  }

  /**
   * Marks the control and descendants as dirty and emits the corresponding event.
   */
  public markAllAsDirty(opts?: Opts): void {
    this.markAsDirty({ emitEvent: false });
    if (this.canISendEvent(opts)) {
      this.onMarkAllAsDirty.emit();
    }
  }

  /**
   * Determines whether event emitters should be triggered based on the given options.
   *
   * @param opts - Options passed to the form state method.
   * @returns True if the event should be emitted.
   */
  private canISendEvent(opts?: Opts): boolean {
    return !opts || Object.keys(opts).length === 0 || opts.emitEvent === true || opts.onlySelf === true;
  }

  /**
   * Checks whether the field should be considered required by inspecting its validators.
   *
   * @param validators - The validator config to evaluate.
   */
  private setIfFieldIsRequired(validators?: RfValidatorsConfig): void {
    const requiredFn = Validators.required;
    if (validators) {
      this.isRequired = this.containsRequiredValidator(validators, requiredFn);
    }
  }

  /**
   * Checks whether a given validator config contains the `Validators.required` function.
   *
   * @param config - The validator config.
   * @param requiredFn - The `Validators.required` reference.
   * @returns True if found.
   */
  private containsRequiredValidator(config: RfValidatorsConfig, requiredFn: ValidatorFn): boolean {
    if (!config) return false;

    if (typeof config === 'function') {
      return this.isSameValidator(config, requiredFn);
    }

    if (Array.isArray(config)) {
      return config.some((v) => this.isSameValidator(v, requiredFn));
    }

    if (typeof config === 'object') {
      return Object.values(config).some((validatorList: ValidatorFn[]) =>
        validatorList.some((v) => this.isSameValidator(v, requiredFn))
      );
    }

    return false;
  }

  /**
   * Compares two validators for identity or matching function name.
   *
   * @param a - Validator A.
   * @param b - Validator B.
   * @returns True if both are considered the same.
   */
  private isSameValidator(a: ValidatorFn, b: ValidatorFn): boolean {
    return a === b || a.name === b.name;
  }

  /**
   * Performs a deep comparison between two objects or values.
   *
   * @param a - First value.
   * @param b - Second value.
   * @returns True if deeply equal.
   */
  private deepEqual(a: any, b: any): boolean {
    if (a === b) return true;

    if (typeof a !== typeof b) return false;
    if (a === null || b === null) return false;

    if (Array.isArray(a) && Array.isArray(b)) {
      if (a.length !== b.length) return false;
      return a.every((item, i) => this.deepEqual(item, b[i]));
    }

    if (typeof a === 'object' && typeof b === 'object') {
      const aKeys = Object.keys(a);
      const bKeys = Object.keys(b);
      if (aKeys.length !== bKeys.length) return false;
      return aKeys.every((key) => b.hasOwnProperty(key) && this.deepEqual(a[key], b[key]));
    }

    return false;
  }
}
