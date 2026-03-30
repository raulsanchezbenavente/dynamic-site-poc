import { Component, signal } from '@angular/core';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { DEFAULT_SHOW_ERRORS_MODE } from '../../../../../lib/abstract/constants/rf-default-values.constant';
import { RfErrorDisplayModes } from '../../../../../lib/abstract/enums/rf-base-reactive-display-mode.enum';
import type { RfErrorMessageSingleComponent } from '../../../../../lib/components/common/rf-error-messages/models/rf-error-messages.model';
import { AutocompleteTypes } from '../../../../../lib/components/rf-input-text/enums/rf-autocomplete-types.enum';
import { RfInputTypes } from '../../../../../lib/components/rf-input-text/models/rf-input-types.model';
import {
  ExactValueValidator,
  StrictEmailValidator,
} from '../../../../../lib/components/rf-input-text/validators/rf-input-text-validators';
import { RfFormControl } from '../../../../../lib/extensions/components/rf-form-control.component';
import { RfFormGroup } from '../../../../../lib/extensions/components/rf-form-group.component';
import { RF_REACTIVE_FORMS_STANDALONE_IMPORTS } from '../../../../../lib/standalone-imports';
import { InvalidWhen } from '../../../../../lib/validators/async-validator.validator';
import { HoverOpacityDirective } from '../../../../tools/directives/hover-opacity-directive.directive';
import { FormValidationFeaturesComponent } from '../../../../tools/form-validation-features/form-validation-features.component';
import { StandaloneValidationFeaturesComponent } from '../../../../tools/standalone-validation-features/standalone-validation-features.component';
import { TabPresentationComponent } from '../../../../tools/tab-presentation/tab-presentation.component';

import { INPUT_TEXT_EMAIL_ERROR_MESSAGES } from './input-text.config';

@Component({
  selector: 'input-text-story',
  templateUrl: './input-text-story.component.html',
  styleUrls: ['./input-text-story.component.scss'],
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
export class InputTextStoryComponent {
  public RfInputTypes = RfInputTypes;
  public Validators = Validators;
  public StrictEmailValidator = StrictEmailValidator;
  public ExactValueValidator = ExactValueValidator;
  public RfErrorDisplayModes = RfErrorDisplayModes;
  public isBlocked = signal(false);
  public myForm = new RfFormGroup(
    'MyForm',
    {
      surname: new RfFormControl('', [Validators.required, InvalidWhen(this.isBlocked, 'myAsyncValidator')]),
      password: new RfFormControl('123456789', [Validators.required]),
      address: new RfFormControl('No name street, 666', [Validators.required]),
      email: new RfFormControl('test@flyr.com', [Validators.required, StrictEmailValidator()]),
      zip: new RfFormControl('66666', [Validators.required, Validators.maxLength(5)]),
      range: new RfFormControl('50', [ExactValueValidator(50)]),
      idcard: new RfFormControl('52408778', [Validators.required]),
      countryDisabled: new RfFormControl({ value: 'Botswana', disabled: true }),
      city: new RfFormControl('', [Validators.required]),
    },
    null,
    null,
    DEFAULT_SHOW_ERRORS_MODE
  );
  public spanishOnlyLetters: RegExp = /[a-zA-ZñÑáéíóúÁÉÍÓÚ\s]/;
  public errorMessages: RfErrorMessageSingleComponent = INPUT_TEXT_EMAIL_ERROR_MESSAGES;
  public hintMessages = 'Enter a valid surname';
  public autocompleteTypes = AutocompleteTypes;
  public onBlur(value: string): void {
    console.log(value);
  }
  public changeValidation(): void {
    this.isBlocked.set(!this.isBlocked());
  }
}
