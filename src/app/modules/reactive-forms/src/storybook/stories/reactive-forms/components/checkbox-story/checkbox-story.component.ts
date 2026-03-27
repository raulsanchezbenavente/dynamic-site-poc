import type { AfterViewInit, OnDestroy } from '@angular/core';
import { Component, viewChild } from '@angular/core';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import type { Subscription } from 'rxjs';

import { DEFAULT_SHOW_ERRORS_MODE } from '../../../../../lib/abstract/constants/rf-default-values.constant';
import type { RfErrorMessageSingleComponent } from '../../../../../lib/components/common/rf-error-messages/models/rf-error-messages.model';
import type { RfCheckboxClasses } from '../../../../../lib/components/rf-checkbox/models/rf-checkbox-classes.model';
import type { RfCheckboxComponent } from '../../../../../lib/components/rf-checkbox/rf-checkbox.component';
import { CheckboxGroupValidator } from '../../../../../lib/components/rf-checkbox/validators/rf-checkbox.validators';
import { RfFormControl } from '../../../../../lib/extensions/components/rf-form-control.component';
import { RfFormGroup } from '../../../../../lib/extensions/components/rf-form-group.component';
import { RfReactiveFormsModule } from '../../../../../lib/reactive-forms.module';
import { HoverOpacityDirective } from '../../../../tools/directives/hover-opacity-directive.directive';
import { FormValidationFeaturesComponent } from '../../../../tools/form-validation-features/form-validation-features.component';
import { StandaloneValidationFeaturesComponent } from '../../../../tools/standalone-validation-features/standalone-validation-features.component';
import { TabPresentationComponent } from '../../../../tools/tab-presentation/tab-presentation.component';

import { CHECKBOX_CUSTOM_CLASSES, CHECKBOX_ERROR } from './checkbox.config';

@Component({
  selector: 'checkbox-story',
  templateUrl: './checkbox-story.component.html',
  styleUrl: './checkbox-story.component.scss',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RfReactiveFormsModule,
    FormValidationFeaturesComponent,
    HoverOpacityDirective,
    TabPresentationComponent,
    StandaloneValidationFeaturesComponent,
    TranslateModule,
  ],
})
export class CheckboxStoryComponent implements AfterViewInit, OnDestroy {
  public checkboxes1 = viewChild<RfCheckboxComponent>('checkboxes1');
  public checkboxesRf1 = viewChild<RfCheckboxComponent>('checkboxesRf1');

  public Validators = Validators;
  public CheckboxGroupValidator = CheckboxGroupValidator;
  public myForm = new RfFormGroup(
    'MyForm',
    {
      checkboxes1: new RfFormControl(['CHECKBOX_1', 'CHECKBOX_2']),
      checkboxes2: new RfFormControl([], [CheckboxGroupValidator({ max: 2 })]),
      checkboxes3: new RfFormControl([], [CheckboxGroupValidator({ min: 2 })]),
      checkboxes4: new RfFormControl([], [Validators.required]),
      checkboxes5: new RfFormControl({ value: ['CHECKBOX_3'], disabled: true }),
      checkboxes6: new RfFormControl({ value: ['CHECKBOX_1', 'CHECKBOX_2', 'CHECKBOX_3'] }, [Validators.required]),
    },
    null,
    null,
    DEFAULT_SHOW_ERRORS_MODE
  );
  public checkboxCustomClasses: RfCheckboxClasses = CHECKBOX_CUSTOM_CLASSES;
  public errorCheckbox: RfErrorMessageSingleComponent = CHECKBOX_ERROR;

  private subscription?: Subscription;

  public ngAfterViewInit(): void {
    requestAnimationFrame(() => {
      this.myForm.valueChanges.subscribe((value: Record<string, any>) => {
        console.log(value);
      });
      this.myForm.get('checkboxes1')?.valueChanges.subscribe((value: string[]) => {
        console.log(value);
      });
      this.subscription = this.checkboxes1()
        ?.getFormControl()
        ?.valueChanges.subscribe((value: string[]) => {
          console.log(value);
        });
    });
  }
  public fillCheckboxRf(): void {
    this.myForm?.get('checkboxes1')?.setValue(['CHECKBOX_2', 'CHECKBOX_3']);
  }
  public fillCheckboxStandalone(): void {
    this.checkboxes1()?.getFormControl()?.setValue(['CHECKBOX_2', 'CHECKBOX_3']);
  }
  public setCheckedRf(): void {
    this.checkboxesRf1()?.setChecked(!this.checkboxesRf1()?.isChecked);
  }
  public setCheckedStandalone(): void {
    this.checkboxes1()?.setChecked(!this.checkboxes1()?.isChecked);
  }
  public ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }
}
