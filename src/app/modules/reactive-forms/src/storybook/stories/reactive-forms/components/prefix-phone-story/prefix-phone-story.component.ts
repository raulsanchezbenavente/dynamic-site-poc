import { Component } from '@angular/core';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import type { SafeHtml } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';

import { DEFAULT_SHOW_ERRORS_MODE } from '../../../../../lib/abstract/constants/rf-default-values.constant';
import { RfAppearanceTypes } from '../../../../../lib/abstract/enums/rf-base-reactive-appearance.enum';
import { RfErrorDisplayModes } from '../../../../../lib/abstract/enums/rf-base-reactive-display-mode.enum';
import { AutocompleteTypes } from '../../../../../lib/components/rf-input-text/enums/rf-autocomplete-types.enum';
import type { RfListOption } from '../../../../../lib/components/rf-list/models/rf-list-option.model';
import type { RfPrefixPhoneClases } from '../../../../../lib/components/rf-prefix-phone/models/rf-prefix-phone-classes.model';
import type { RfPrefixPhoneErrorMessages } from '../../../../../lib/components/rf-prefix-phone/models/rf-prefix-phone-error-messages.model';
import type { RfPrefixPhoneHintMessages } from '../../../../../lib/components/rf-prefix-phone/models/rf-prefix-phone-hint-messages.model';
import { RfPrefixPhoneComponent } from '../../../../../lib/components/rf-prefix-phone/rf-prefix-phone.component';
import { RfFormControl } from '../../../../../lib/extensions/components/rf-form-control.component';
import { RfFormGroup } from '../../../../../lib/extensions/components/rf-form-group.component';
import { HoverOpacityDirective } from '../../../../tools/directives/hover-opacity-directive.directive';
import { FormValidationFeaturesComponent } from '../../../../tools/form-validation-features/form-validation-features.component';
import { StandaloneValidationFeaturesComponent } from '../../../../tools/standalone-validation-features/standalone-validation-features.component';
import { TabPresentationComponent } from '../../../../tools/tab-presentation/tab-presentation.component';
import { PREFIX_OPTIONS } from '../list-story/list.config';

import { PrefixPhoneDefaultDirective } from './configDirectives/prefix-phone-default.directive';
import { PREFIX_ALL_COUNTRIES } from './prefix-list/prefix-list';
import {
  ERROR_MESSAGES_PHONE,
  HINT_MESSAGES_GENERAL_PREFIX_PHONE,
  HINT_MESSAGES_SPECIFIC_PREFIX_PHONE,
  PREFIX_GROUP_LAYOUT_CUSTOM_CLASS,
  PREFIX_PHONE_CUSTOM_CLASSES,
} from './prefix-phone.config';

@Component({
  selector: 'prefix-phone-story',
  templateUrl: './prefix-phone-story.component.html',
  styleUrls: ['./prefix-phone-story.component.scss'],
  imports: [
    ReactiveFormsModule,
    RfPrefixPhoneComponent,
    FormValidationFeaturesComponent,
    StandaloneValidationFeaturesComponent,
    HoverOpacityDirective,
    TabPresentationComponent,
    PrefixPhoneDefaultDirective,
    TranslateModule,
  ],
})
export class PrefixPhoneStoryComponent {
  public Validators = Validators;
  public RfErrorDisplayModes = RfErrorDisplayModes;
  public RfAppearanceTypes = RfAppearanceTypes;
  public autocompleteTypes = AutocompleteTypes;
  public validatorPattern = Validators.pattern(/^\d+$/);
  public myForm = new RfFormGroup(
    'MyForm',
    {
      phoneNumber1: new RfFormControl(''),
      phoneNumber1a: new RfFormControl(''),
      phoneNumber2: new RfFormControl({ value: { prefix: '+34', phone: '855698745' } }),
      // phoneNumber3: new RfFormControl({ value: { prefix: '', phone: '' }, disabled: true }),
      phoneNumber3: new RfFormControl(
        { value: { prefix: '', phone: '' }, disabled: false },
        {
          prefix: [Validators.required],
          phone: [Validators.required, this.validatorPattern, Validators.minLength(9), Validators.maxLength(9)],
        }
      ),
      phoneNumber4: new RfFormControl(
        { prefix: '+57', phone: '98856558' },
        {
          prefix: [Validators.required],
          phone: [Validators.required, this.validatorPattern, Validators.minLength(9), Validators.maxLength(9)],
        }
      ),
      phoneNumber5: new RfFormControl(''),
      phoneNumber6: new RfFormControl(
        { value: { prefix: '+34', phone: '647558961' } },
        {
          prefix: [Validators.required],
          phone: [Validators.required, this.validatorPattern, Validators.minLength(9), Validators.maxLength(9)],
        }
      ),
      phoneNumber7: new RfFormControl(
        { value: { prefix: '', phone: '' }, disabled: true },
        {
          prefix: [Validators.required],
          phone: [Validators.required, this.validatorPattern, Validators.minLength(9), Validators.maxLength(9)],
        }
      ),
      phoneNumber8: new RfFormControl(
        { value: { prefix: '+33', phone: '789588715' }, disabled: false },
        {
          prefix: [Validators.required],
          phone: [Validators.required, this.validatorPattern, Validators.minLength(9), Validators.maxLength(9)],
        }
      ),
    },
    null,
    null,
    DEFAULT_SHOW_ERRORS_MODE
  );
  public errorMessagesPhone: RfPrefixPhoneErrorMessages = ERROR_MESSAGES_PHONE;

  public hintMessagesGeneralPrefixPhone: RfPrefixPhoneHintMessages = HINT_MESSAGES_GENERAL_PREFIX_PHONE;
  public hintMessagesSpecificPrefixPhone: RfPrefixPhoneHintMessages = HINT_MESSAGES_SPECIFIC_PREFIX_PHONE;

  public prefixPhoneCustomClasses: RfPrefixPhoneClases = PREFIX_PHONE_CUSTOM_CLASSES;
  public prefixPhoneInlineCustomClasses: RfPrefixPhoneClases = PREFIX_GROUP_LAYOUT_CUSTOM_CLASS;
  public prefixOptions: RfListOption[] = PREFIX_OPTIONS;
  public allPrefix: RfListOption[] = PREFIX_ALL_COUNTRIES;

  public onlyNumbers: RegExp = /\d/;
  protected prefixMask = (data: SafeHtml): SafeHtml => {
    if (!data) return '';
    const match: RegExpMatchArray | null = String(data).match(/\+(\d+)/);
    return match?.[1] ?? '';
  };
}
