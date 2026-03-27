import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

import { SwitchValidationConfig } from '../models/switch-validation-config';

export function switchRequired(config: SwitchValidationConfig): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    return control.value === config.requiredValue
      ? null
      : { switchRequired: { expected: config.requiredValue, actual: control.value } };
  };
}
