import { FormControl } from '@angular/forms';

export interface MinusPlusVM {
  formValidationConfig: {
    formControlName: string;
    formControl: FormControl;
    minValue: number;
    maxValue: number;
    isReadOnly: boolean;
  };
  /**
   * Accessibility labels
   */
  labelledBy: string;
  statusLabel: string;
  minusLabel: string;
  plusLabel: string;
}
