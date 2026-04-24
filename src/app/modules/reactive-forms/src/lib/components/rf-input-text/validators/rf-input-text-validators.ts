import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function ExactValueValidator(expected: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    return value === String(expected) ? null : { exactValue: { requiredValue: expected, actual: value } };
  };
}

export function StrictEmailValidator(): ValidatorFn {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value || typeof value !== 'string') {
      return null;
    }

    return emailRegex.test(value) ? null : { strictEmail: 'strictEmail' };
  };
}
