import { Component, EventEmitter, Input, Output } from '@angular/core';
import type { RfComponentTypes, RfValidatorsConfig } from 'reactive-forms';

/**
 * Dummy component to expose `RfFormControl` API for Storybook autodocs.
 * This component mimics the public API of the real class, with empty methods and annotated properties.
 */
@Component({
  selector: 'form-control-fake',
  template: '',
  standalone: true,
})
export class FormControlFakeComponent {
  /** Emits when the control is marked as touched. */
  @Output() public onMarkAsTouched = new EventEmitter<void>();

  /** Emits when the control and all children are marked as touched. */
  @Output() public onMarkAllAsTouched = new EventEmitter<void>();

  /** Emits when the control is marked as untouched. */
  @Output() public onMarkAsUntouched = new EventEmitter<void>();

  /** Emits when the control is marked as dirty. */
  @Output() public onMarkAsDirty = new EventEmitter<void>();

  /** Emits when the control and all children are marked as dirty. */
  @Output() public onMarkAllAsDirty = new EventEmitter<void>();

  /** Emits when the control is marked as pristine. */
  @Output() public onMarkAsPristine = new EventEmitter<void>();

  /** Emits when the control's value is updated via `setValue()`. */
  @Output() public onSetValue = new EventEmitter<any>();

  /** Indicates whether the control is required based on its validator configuration. */
  @Input() public isRequired: boolean = false;

  /** Reference to the component(s) associated with this control. */
  @Input() public rfComponent!: RfComponentTypes | RfComponentTypes[];

  /** Stores the custom validators assigned to the control. */
  private customValidators: RfValidatorsConfig = null;

  /** Internal storage for submitted state. */
  private _submitted: boolean = false;

  /**
   * Gets whether the control has been submitted.
   */
  @Input()
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
   * Sets the control's value and emits the `onSetValue` event.
   */
  public setValue(value: any, opts?: any): void {
    this.onSetValue.emit(value);
  }

  /** Marks the control as touched and emits the `onMarkAsTouched` event. */
  public markAsTouched(opts?: any): void {
    this.onMarkAsTouched.emit();
  }

  /** Marks the control and descendants as touched. */
  public markAllAsTouched(opts?: any): void {
    this.onMarkAllAsTouched.emit();
  }

  /** Marks the control as untouched and emits the `onMarkAsUntouched` event. */
  public markAsUntouched(opts?: any): void {
    this.onMarkAsUntouched.emit();
  }

  /** Marks the control as dirty and emits the `onMarkAsDirty` event. */
  public markAsDirty(opts?: any): void {
    this.onMarkAsDirty.emit();
  }

  /** Marks the control as pristine and emits the `onMarkAsPristine` event. */
  public markAsPristine(opts?: any): void {
    this.onMarkAsPristine.emit();
  }

  /** Marks the control and descendants as dirty. */
  public markAllAsDirty(opts?: any): void {
    this.onMarkAllAsDirty.emit();
  }
}
