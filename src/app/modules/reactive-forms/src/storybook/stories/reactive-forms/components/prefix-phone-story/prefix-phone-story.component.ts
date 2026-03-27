import { Component, inject, viewChild } from '@angular/core';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import type { SafeHtml } from '@angular/platform-browser';
import type { CountryResult } from '@dcx/ui/business-common';
import { PhoneCountryService } from '@dcx/ui/business-common';
import { TranslateModule } from '@ngx-translate/core';

import { DEFAULT_SHOW_ERRORS_MODE } from '../../../../../lib/abstract/constants/rf-default-values.constant';
import { RfAppearanceTypes } from '../../../../../lib/abstract/enums/rf-base-reactive-appearance.enum';
import { RfErrorDisplayModes } from '../../../../../lib/abstract/enums/rf-base-reactive-display-mode.enum';
import { AutocompleteTypes } from '../../../../../lib/components/rf-input-text/enums/rf-autocomplete-types.enum';
import type { RfListOption } from '../../../../../lib/components/rf-list/models/rf-list-option.model';
import type { RfPrefixPhoneClases } from '../../../../../lib/components/rf-prefix-phone/models/rf-prefix-phone-classes.model';
import type { RfPrefixPhoneErrorMessages } from '../../../../../lib/components/rf-prefix-phone/models/rf-prefix-phone-error-messages.model';
import type { RfPrefixPhoneHintMessages } from '../../../../../lib/components/rf-prefix-phone/models/rf-prefix-phone-hint-messages.model';
import type { RfPrefixPhoneComponent } from '../../../../../lib/components/rf-prefix-phone/rf-prefix-phone.component';
import { RfFormControl } from '../../../../../lib/extensions/components/rf-form-control.component';
import { RfFormGroup } from '../../../../../lib/extensions/components/rf-form-group.component';
import { RfReactiveFormsModule } from '../../../../../lib/reactive-forms.module';
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
    RfReactiveFormsModule,
    FormValidationFeaturesComponent,
    StandaloneValidationFeaturesComponent,
    HoverOpacityDirective,
    TabPresentationComponent,
    PrefixPhoneDefaultDirective,
    TranslateModule,
  ],
})
export class PrefixPhoneStoryComponent {
  public phoneCountryService = inject(PhoneCountryService);
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
  public prefixphone1 = viewChild<RfPrefixPhoneComponent>('prefixphone1');
  public prefixphone1a = viewChild<RfPrefixPhoneComponent>('prefixphone1a');
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

  public options = [
    { prefix: 'Select a phone number', phone: '', country: '' },
    { prefix: '+1', phone: '7875550000', country: 'Puerto Rico' },
    { prefix: '+1', phone: '2125551234', country: 'Estados Unidos' },
    { prefix: '+1', phone: '4165551234', country: 'Canadá' },
    { prefix: '+1', phone: '8681234567', country: 'Trinidad y Tobago' },
    { prefix: '+1', phone: '6491234567', country: 'Islas Turcas y Caicos' },
    { prefix: '+44', phone: '1624123456', country: 'Isla de Man' },
    { prefix: '+44', phone: '1481123456', country: 'Guernsey' },
    { prefix: '+44', phone: '1534123456', country: 'Jersey' },
    { prefix: '+44', phone: '2079460958', country: 'Reino Unido' },
    { prefix: '+262', phone: '639123456', country: 'Mayotte' },
    { prefix: '+262', phone: '262123456', country: 'Reunión' },
    { prefix: '+358', phone: '18123456', country: 'Islas Åland' },
    { prefix: '+358', phone: '401234567', country: 'Finlandia' },
    { prefix: '+7', phone: '7011234567', country: 'Kazajistán' },
    { prefix: '+7', phone: '9123456789', country: 'Rusia' },
    { prefix: '+39', phone: '0669812345', country: 'Ciudad del Vaticano' },
    { prefix: '+39', phone: '0234567890', country: 'Italia' },
    { prefix: '+61', phone: '891641234', country: 'Isla Christmas' },
    { prefix: '+61', phone: '891621234', country: 'Islas Cocos' },
    { prefix: '+61', phone: '412345678', country: 'Australia' },
    { prefix: '+290', phone: '81234', country: 'Tristán de Acuña' },
    { prefix: '+290', phone: '21234', country: 'Santa Elena' },
    { prefix: '+590', phone: '590123456', country: 'GP/BL/MF (Share prefix)' },
    { prefix: '+599', phone: '9123456', country: 'Curazao' },
    { prefix: '+599', phone: '3181234', country: 'Caribe Neerlandés' },
    { prefix: '+672', phone: '1xxxxxxx', country: 'Antártida Australiana' },
    { prefix: '+672', phone: '3xxxxxxx', country: 'Isla Norfolk' },
    { prefix: '+672', phone: '9xxxxxxx', country: 'AQ/NF (Ambiguo)' },
  ];

  public onSelectChange(event: Event, standalone: boolean): void {
    const target = event.target as HTMLSelectElement;
    if (!target.value) return;
    const [prefix, phone] = target.value.split('|');
    this.countryFromPrefix(prefix, phone, standalone);
  }

  public countryFromPrefix(prefix: string, phone: string, standalone: boolean): void {
    const countryCodeResult: CountryResult = this.phoneCountryService.countryFromPrefix(prefix, phone);
    const countryCode: string = typeof countryCodeResult === 'string' ? countryCodeResult : countryCodeResult[0];
    const phoneNumber = { prefix: prefix.replace(/\+/gi, '') + '-' + countryCode, phone };
    console.log(phoneNumber);
    if (standalone) {
      this.prefixphone1()?.getFormControl()?.setValue(phoneNumber);
      this.prefixphone1a()?.getFormControl()?.setValue(phoneNumber);
    } else {
      this.myForm.get('phoneNumber1')?.setValue(phoneNumber);
      this.myForm.get('phoneNumber1a')?.setValue(phoneNumber);
    }
  }
}
