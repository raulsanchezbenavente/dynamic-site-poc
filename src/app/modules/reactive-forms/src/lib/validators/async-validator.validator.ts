import { DestroyRef, effect, inject, Signal } from '@angular/core';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function InvalidWhen(flag: Signal<boolean>, errorKey = 'async', payload: any = true): ValidatorFn {
  return (_: AbstractControl): ValidationErrors | null => (flag() ? { [errorKey]: payload } : null);
}

export function bindValidatorSignals(control: AbstractControl, ...signals: Signal<unknown>[]): void {
  const destroyRef = inject(DestroyRef);
  const ref = effect(() => {
    for (const s of signals) s();
    control.updateValueAndValidity({ onlySelf: true, emitEvent: false });
  });
  destroyRef.onDestroy(() => ref.destroy());
}
