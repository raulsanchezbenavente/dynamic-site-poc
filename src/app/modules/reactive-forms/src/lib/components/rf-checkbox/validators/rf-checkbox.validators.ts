import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

interface CheckboxGroupValidatorOptions {
  min?: number;
  max?: number;
  required?: boolean;
  exact?: number;
}

export function CheckboxGroupValidator(options: CheckboxGroupValidatorOptions): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const values = control.value;

    if (!Array.isArray(values)) {
      return { invalidType: true };
    }

    const count = values.length;

    const errors: ValidationErrors = {};

    if (options.required && count === 0) {
      errors['required'] = true;
    }

    if (typeof options.min === 'number' && count < options.min) {
      errors['minSelected'] = {
        required: options.min,
        actual: count,
      };
    }

    if (typeof options.max === 'number' && count > options.max) {
      errors['maxSelected'] = {
        allowed: options.max,
        actual: count,
      };
    }

    if (typeof options.exact === 'number' && count !== options.exact) {
      errors['exactSelected'] = {
        expected: options.exact,
        actual: count,
      };
    }

    return Object.keys(errors).length > 0 ? errors : null;
  };
}
