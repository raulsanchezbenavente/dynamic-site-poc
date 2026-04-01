import { Component, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';
import { AbstractControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { GenerateIdPipe, MinusPlusVM } from '@dcx/ui/libs';

/**
 * This component allow select a range of numbers
 */
@Component({
  selector: 'minus-plus',
  templateUrl: './minus-plus.component.html',
  styleUrls: ['./styles/minus-plus.styles.scss'],
  encapsulation: ViewEncapsulation.None,
  imports: [ReactiveFormsModule],
  standalone: true
})
export class MinusPlusComponent {
  public formControl!: AbstractControl;
  public id!: string;
  private _minValue!: number;
  private _maxValue!: number;
  private _minusPlusVM!: MinusPlusVM;

  @Output() private readonly minusEmmited = new EventEmitter();
  @Output() private readonly plusEmmited = new EventEmitter();

  constructor(protected generateId: GenerateIdPipe) {
    this.id = this.generateId.transform('minusPlusId_');
    this.formControl = {} as AbstractControl;
  }

  @Input() set minusPlusVM(value: MinusPlusVM) {
    this._minusPlusVM = value;
    this.formControl = this._minusPlusVM.formValidationConfig.formControl;
    this.updateMinPlusValues();
  }

  get minusPlusVM(): MinusPlusVM {
    return this._minusPlusVM;
  }

  /**
   * Less an unit (-1) to current value
   */
  public minus(): void {
    if (this.isMinusEnable()) {
      const currentValue = this.getCurrentValue();
      this.setFormControlValue(currentValue - 1);
      this.minusEmmited.next(undefined);
    }
  }

  /**
   * Add an unit (+1) to current value
   */
  public plus(): void {
    if (this.isPlusEnable()) {
      const currentValue = this.getCurrentValue();
      this.setFormControlValue(currentValue + 1);
      this.plusEmmited.next(undefined);
    }
  }

  /**
   * Return if the control allows subtracting units
   */
  public isMinusEnable(): boolean {
    return this.getCurrentValue() > this.getMinValue();
  }

  /**
   * Return if the control allows adding units
   */
  public isPlusEnable(): boolean {
    return this.getCurrentValue() < this.getMaxValue();
  }

  /**
   * Set new value to the control
   * @param value new value
   */
  public setFormControlValue(value: number): void {
    this.formControl.setValue(value);
    this.validateMinMax();
  }

  /**
   * Return current control value
   */
  private getCurrentValue(): number {
    return this.formControl.value as number;
  }

  /**
   * Return minimum value allowed
   */
  private getMinValue(): number {
    const minValue = this.minusPlusVM.formValidationConfig.minValue;
    if (this._minValue !== minValue) {
      this.updateMinPlusValues();
    }
    return minValue;
  }

  /**
   * Return maximum value allowed
   */
  private getMaxValue(): number {
    const maxValue = this.minusPlusVM.formValidationConfig.maxValue;
    if (this._maxValue !== maxValue) {
      this.updateMinPlusValues();
    }
    return maxValue;
  }

  /**
   * Update minimum and maximun values to the controlForm
   */
  private updateMinPlusValues(): void {
    this._maxValue = this.minusPlusVM.formValidationConfig.maxValue;
    this._minValue = this.minusPlusVM.formValidationConfig.minValue;

    this.formControl.setValidators([Validators.min(this._minValue), Validators.max(this._maxValue)]);

    this.formControl.updateValueAndValidity();
    this.validateMinMax();
  }

  /**
   * Validate errors of min and max, if exist error change the value to an allows value
   */
  private validateMinMax(): void {
    if (this.formControl?.errors?.['min']) {
      this.formControl.setValue(this.getMinValue());
    } else if (this.formControl?.errors?.['max']) {
      this.formControl.setValue(this.getMaxValue());
    }
  }
}
