import { JsonPipe, NgClass } from '@angular/common';
import type { OnInit } from '@angular/core';
import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { DsButtonComponent } from '@dcx/ui/design-system';
import { ButtonStyles, LayoutSize } from '@dcx/ui/libs';
import { AutocompleteTypes, RfInputTextComponent } from 'reactive-forms';

import { RfErrorDisplayModes } from '../../../../lib/abstract/enums/rf-base-reactive-display-mode.enum';
import { RfFormControl } from '../../../../lib/extensions/components/rf-form-control.component';
import { RfFormGroup } from '../../../../lib/extensions/components/rf-form-group.component';
import { RfFormStore } from '../../../../lib/store/rf-form.store';

@Component({
  selector: 'lib-form-store-story',
  imports: [NgClass, JsonPipe, ReactiveFormsModule, RfInputTextComponent, DsButtonComponent],
  templateUrl: './form-store-story.component.html',
  styleUrl: './form-store-story.component.scss',
})
export class FormStoreStoryComponent implements OnInit {
  public AutocompleteTypes = AutocompleteTypes;
  public myForm!: RfFormGroup;
  public myForm2!: RfFormGroup;
  protected readonly formStore = inject(RfFormStore);
  protected buttonConfig = {
    layout: {
      size: LayoutSize.MEDIUM,
      style: ButtonStyles.PRIMARY,
    },
  };

  public form1ValueChanges: string[] = [];
  private unsubscribeForm1ValueChanges: (() => void) | undefined;

  public form1NameErrors: string[] = [];
  public form1EmailErrors: string[] = [];
  public form1AgeErrors: string[] = [];

  public get formGroupsKeys(): string[] {
    return Array.from(this.formStore.formGroups().keys());
  }

  public get controlsSummary(): Record<string, string[]> {
    const CONTROLS_SUMMARY: Record<string, string[]> = {};
    this.formStore.controls().forEach((controls, formKey) => {
      CONTROLS_SUMMARY[formKey] = Array.from(controls.keys());
    });
    return CONTROLS_SUMMARY;
  }

  public get allControlErrors(): Record<string, Record<string, unknown>> {
    const ALL_CONTROL_ERRORS: Record<string, Record<string, unknown>> = {};
    this.formStore.controls().forEach((controls, formKey) => {
      ALL_CONTROL_ERRORS[formKey] = {};
      controls.forEach((control, controlKey) => {
        ALL_CONTROL_ERRORS[formKey][controlKey] = control.errors;
      });
    });
    return ALL_CONTROL_ERRORS;
  }

  public get allControlValues(): Record<string, Record<string, unknown>> {
    const ALL_CONTROL_VALUES: Record<string, Record<string, unknown>> = {};
    this.formStore.controls().forEach((controls, formKey) => {
      ALL_CONTROL_VALUES[formKey] = {};
      controls.forEach((control, controlKey) => {
        ALL_CONTROL_VALUES[formKey][controlKey] = control.value;
      });
    });
    return ALL_CONTROL_VALUES;
  }

  public ngOnInit(): void {
    this.myForm = new RfFormGroup(
      'StoryForm',
      {
        name: new RfFormControl('Fulano', []),
        email: new RfFormControl('test@flyr.com', [Validators.required, Validators.email]),
        age: new RfFormControl('30', []),
      },
      null,
      null,
      RfErrorDisplayModes.ALWAYS
    );
    this.formStore.setFormGroup('StoryForm', this.myForm);

    this.myForm2 = new RfFormGroup(
      'StoryForm2',
      {
        name: new RfFormControl('Mengano', [Validators.required]),
        email: new RfFormControl('mengano@flyr.com', []),
        age: new RfFormControl('50', []),
      },
      null,
      null,
      RfErrorDisplayModes.ALWAYS
    );
    this.formStore.setFormGroup('StoryForm2', this.myForm2);

    this.unsubscribeForm1ValueChanges = this.formStore.onFormValueChanges('StoryForm', (value) => {
      this.form1ValueChanges.push(JSON.stringify(value));
    });
    this.updateForm1Errors();
    this.myForm.valueChanges.subscribe(() => this.updateForm1Errors());
  }

  private updateForm1Errors(): void {
    this.form1NameErrors = this.formStore.getControlErrors('StoryForm', 'name')
      ? Object.entries(this.formStore.getControlErrors('StoryForm', 'name')!).map(
          ([k, v]) => `${k}: ${JSON.stringify(v)}`
        )
      : [];
    this.form1EmailErrors = this.formStore.getControlErrors('StoryForm', 'email')
      ? Object.entries(this.formStore.getControlErrors('StoryForm', 'email')!).map(
          ([k, v]) => `${k}: ${JSON.stringify(v)}`
        )
      : [];
    this.form1AgeErrors = this.formStore.getControlErrors('StoryForm', 'age')
      ? Object.entries(this.formStore.getControlErrors('StoryForm', 'age')!).map(
          ([k, v]) => `${k}: ${JSON.stringify(v)}`
        )
      : [];
  }

  public removeForm1(): void {
    this.formStore.removeFormGroup('StoryForm');
    this.form1ValueChanges = [];
    this.form1NameErrors = [];
    this.form1EmailErrors = [];
    this.form1AgeErrors = [];
    if (this.unsubscribeForm1ValueChanges) {
      this.unsubscribeForm1ValueChanges();
      this.unsubscribeForm1ValueChanges = undefined;
    }
  }

  protected disableEmail(): void {
    this.formStore.disableControl('StoryForm', 'email', true);
  }

  protected enableEmail(): void {
    this.formStore.disableControl('StoryForm', 'email', false);
  }

  protected disableAllForm(): void {
    this.formStore.formGroups()?.get('StoryForm')?.disable();
  }

  protected enableAllForm(): void {
    this.formStore.formGroups()?.get('StoryForm')?.enable();
  }

  protected console(): void {
    console.log(this.formStore.formStatus());
    console.log(this.formStore.formGroups());
    console.log(this.formStore.controls());
    console.log(this.formStore.formValue());
  }

  protected resetForm(): void {
    this.formStore.resetForm('StoryForm');
  }

  protected changeValue(): void {
    this.formStore.setNewValueOnControl('StoryForm', 'name', 'Sultano');
  }

  protected changeValidator(): void {
    this.formStore.setValidatorOnControl('StoryForm', 'name', [Validators.required]);
    this.myForm.updateValueAndValidity({ emitEvent: true });
  }
}
