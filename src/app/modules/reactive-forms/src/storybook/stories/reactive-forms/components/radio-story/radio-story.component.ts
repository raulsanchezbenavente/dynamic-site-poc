import type { AfterViewInit, OnDestroy } from '@angular/core';
import { Component, viewChild } from '@angular/core';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import type { Subscription } from 'rxjs';

import { DEFAULT_SHOW_ERRORS_MODE } from '../../../../../lib/abstract/constants/rf-default-values.constant';
import type { RfErrorMessageSingleComponent } from '../../../../../lib/components/common/rf-error-messages/models/rf-error-messages.model';
import { RfInputTypes } from '../../../../../lib/components/rf-input-text/models/rf-input-types.model';
import type { RfRadioClasses } from '../../../../../lib/components/rf-radio/models/rf-radio-classes.model';
import type { RfRadioComponent } from '../../../../../lib/components/rf-radio/rf-radio.component';
import { RfFormControl } from '../../../../../lib/extensions/components/rf-form-control.component';
import { RfFormGroup } from '../../../../../lib/extensions/components/rf-form-group.component';
import { RF_REACTIVE_FORMS_STANDALONE_IMPORTS } from '../../../../../lib/standalone-imports';
import { HoverOpacityDirective } from '../../../../tools/directives/hover-opacity-directive.directive';
import { FormValidationFeaturesComponent } from '../../../../tools/form-validation-features/form-validation-features.component';
import { StandaloneValidationFeaturesComponent } from '../../../../tools/standalone-validation-features/standalone-validation-features.component';
import { TabPresentationComponent } from '../../../../tools/tab-presentation/tab-presentation.component';

import { ERROR_RADIOS, RADIO_CUSTOM_CLASSES } from './radio.config';

@Component({
  selector: 'radio-story',
  templateUrl: './radio-story.component.html',
  styleUrl: './radio-story.component.scss',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ...RF_REACTIVE_FORMS_STANDALONE_IMPORTS,
    FormValidationFeaturesComponent,
    HoverOpacityDirective,
    TabPresentationComponent,
    StandaloneValidationFeaturesComponent,
    TranslateModule,
  ],
})
export class RadioStoryComponent implements AfterViewInit, OnDestroy {
  public radios1Rf = viewChild<RfRadioComponent>('radios1Rf');
  public radios1 = viewChild<RfRadioComponent>('radios1');
  public radios2 = viewChild<RfRadioComponent>('radios2');

  public RfInputTypes = RfInputTypes;
  public Validators = Validators;
  public myForm = new RfFormGroup(
    'MyForm',
    {
      radios1: new RfFormControl({ value: 'RADIO_1', disabled: false }),
      radios2: new RfFormControl('', [Validators.required]),
      radios3: new RfFormControl({ value: 'RADIO_3', disabled: true }),
      radios4: new RfFormControl('RADIO_2'),
    },
    null,
    null,
    DEFAULT_SHOW_ERRORS_MODE
  );
  public radioCustomClasses: RfRadioClasses = RADIO_CUSTOM_CLASSES;
  public errorRadio: RfErrorMessageSingleComponent = ERROR_RADIOS;

  private subscription?: Subscription;

  public ngAfterViewInit(): void {
    requestAnimationFrame(() => {
      this.myForm.valueChanges.subscribe((value: Record<string, any>) => {
        console.log(value);
      });
      this.myForm.get('radios1')?.valueChanges.subscribe((value: string) => {
        console.log(value);
      });
      this.subscription = this.radios1()
        ?.getFormControl()
        ?.valueChanges.subscribe((value: string[]) => {
          console.log(value);
        });
    });
  }
  public setRadioRf(): void {
    this.myForm?.get('radios1')?.setValue('RADIO_3');
  }
  public unselectRadioRf(): void {
    this.myForm?.get('radios2')?.setValue(null);
  }
  public fillRadioStandalone(): void {
    this.radios1()?.getFormControl()?.setValue('RADIO_3');
  }
  public unselectRadioStandalone(): void {
    this.radios2()?.getFormControl()?.setValue(null);
  }
  public setSelectedRf(): void {
    this.radios1Rf()?.setSelected(!this.radios1Rf()?.isSelected);
  }
  public setSelectedStandalone(): void {
    this.radios1()?.setSelected(!this.radios1()?.isSelected);
  }
  public ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }
}
