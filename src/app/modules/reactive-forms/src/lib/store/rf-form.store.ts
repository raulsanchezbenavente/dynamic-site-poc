/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/naming-convention */
import { computed } from '@angular/core';
import { AbstractControl, ValidatorFn } from '@angular/forms';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';

import { RfFormGroup } from '../extensions/components/rf-form-group.component';

import { FormState } from './form.state';

const initialFormState: FormState = {
  formGroups: new Map<string, RfFormGroup>(),
};

const ERROR_FORM_NOT_FOUND = (formKey: string, method: string) =>
  `Form group with key '${formKey}' not found for ${method}.`;

const ERROR_CONTROL_NOT_FOUND = (controlName: string, formKey: string) =>
  `Control '${controlName}' not found in form '${formKey}'.`;

export const RfFormStore = signalStore(
  { providedIn: 'root' },
  withState(initialFormState),
  withComputed(({ formGroups }) => ({
    formValue: computed(() => {
      const valueMap = new Map<string, unknown>();
      for (const [key, formGroup] of formGroups()) {
        valueMap.set(key, formGroup.valueSignal());
      }
      return valueMap;
    }),
    formStatus: computed(() => {
      const statusMap = new Map<string, string>();
      for (const [key, formGroup] of formGroups()) {
        statusMap.set(key, formGroup.statusSignal());
      }
      return statusMap;
    }),
    controls: computed(() => {
      const controlsMap = new Map<string, Map<string, AbstractControl>>();
      for (const [key, formGroup] of formGroups()) {
        const innerControls = formGroup.controls;
        if (innerControls) {
          const groupControlsMap = new Map<string, AbstractControl>();
          for (const controlName of Object.keys(innerControls)) {
            groupControlsMap.set(controlName, innerControls[controlName]);
          }
          controlsMap.set(key, groupControlsMap);
        }
      }
      return controlsMap;
    }),
  })),
  withMethods((store) => ({
    getFormGroup(formKey: string): RfFormGroup | undefined {
      return store.formGroups().get(formKey);
    },
    setFormGroup(formKey: string, formGroup: RfFormGroup): boolean {
      if (store.formGroups().has(formKey)) {
        console.warn(`Form group with key '\${formKey}' already exists.`);
        return false;
      }

      const updatedFormGroups = new Map(store.formGroups());
      updatedFormGroups.set(formKey, formGroup);

      patchState(store, { formGroups: updatedFormGroups });
      return true;
    },
    removeFormGroup(formKey: string): boolean {
      if (!store.formGroups().has(formKey)) {
        console.warn(`Form group with key '\${formKey}' does not exist.`);
        return false;
      }
      const updatedFormGroups = new Map(store.formGroups());
      updatedFormGroups.delete(formKey);
      patchState(store, { formGroups: updatedFormGroups });
      return true;
    },
    removeAllFormGroups(): void {
      if (store.formGroups().size === 0) {
        console.warn('No form groups to remove.');
        return;
      }
      patchState(store, { formGroups: new Map<string, RfFormGroup>() });
    },
    isValid(formKey: string): boolean | undefined {
      const status = store.formStatus().get(formKey);
      if (status === undefined) {
        console.warn(`Form group with key '\${formKey}' does not exist for isValid check.`);
        return undefined;
      }
      return status === 'VALID';
    },
    resetForm(formKey: string): boolean {
      const formGroup = store.formGroups().get(formKey);
      if (formGroup) {
        formGroup.reset();
        return true;
      }
      console.warn(`Form group with key '\${formKey}' not found for reset.`);
      return false;
    },
    disableControl(formKey: string, controlName: string, disable: boolean): boolean {
      const formGroup = store.formGroups().get(formKey);
      if (!formGroup) {
        console.warn(ERROR_FORM_NOT_FOUND(formKey, 'disableControl'));
        return false;
      }
      const control = formGroup.get(controlName);
      if (!control) {
        console.warn(ERROR_CONTROL_NOT_FOUND(controlName, formKey));
        return false;
      }
      if (disable) {
        control.disable();
      } else {
        control.enable();
      }
      return true;
    },
    setNewValueOnControl(formKey: string, controlName: string, value: unknown): boolean {
      const formGroup = store.formGroups().get(formKey);
      if (!formGroup) {
        console.warn(ERROR_FORM_NOT_FOUND(formKey, 'setNewValueOnControl'));
        return false;
      }
      const control = formGroup.get(controlName);
      if (!control) {
        console.warn(ERROR_CONTROL_NOT_FOUND(controlName, formKey));
        return false;
      }
      control.setValue(value);
      return true;
    },
    setValidatorOnControl(formKey: string, controlName: string, validator: ValidatorFn | ValidatorFn[]): boolean {
      const formGroup = store.formGroups().get(formKey);
      if (!formGroup) {
        console.warn(ERROR_FORM_NOT_FOUND(formKey, 'setValidatorOnControl'));
        return false;
      }
      const control = formGroup.get(controlName);
      if (!control) {
        console.warn(ERROR_CONTROL_NOT_FOUND(controlName, formKey));
        return false;
      }
      control.setValidators(validator);
      control.updateValueAndValidity({ emitEvent: true });
      return true;
    },
    getControlErrors(formKey: string, controlName: string): Record<string, unknown> | null | undefined {
      const formGroup = store.formGroups().get(formKey);
      if (!formGroup) {
        console.warn(ERROR_FORM_NOT_FOUND(formKey, 'getControlErrors'));
        return undefined;
      }
      const control = formGroup.get(controlName);
      if (!control) {
        console.warn(ERROR_CONTROL_NOT_FOUND(controlName, formKey));
        return undefined;
      }
      return control.errors;
    },
    onFormValueChanges(formKey: string, callback: (value: unknown) => void): (() => void) | undefined {
      const formGroup = store.formGroups().get(formKey);
      if (!formGroup) {
        console.warn(ERROR_FORM_NOT_FOUND(formKey, 'onFormValueChanges'));
        return undefined;
      }
      const subscription = formGroup.valueChanges.subscribe(callback);
      return () => subscription.unsubscribe();
    },
  }))
);
