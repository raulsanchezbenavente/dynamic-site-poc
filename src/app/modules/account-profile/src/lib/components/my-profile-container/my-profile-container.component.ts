import {
  ChangeDetectionStrategy,
  Component,
  effect,
  EventEmitter,
  inject,
  input,
  OnInit,
  Output,
  signal,
} from '@angular/core';
import { ValidatorFn, Validators } from '@angular/forms';
import { AccountModels, AccountV2Models } from '@dcx/module/api-clients';
import { PersonCommunicationChannelType } from '@dcx/module/booking-api-client';
import { RfFormSummaryStore } from '@dcx/ui/business-common';
import {
  PanelAppearance,
  PanelBaseConfig,
  PanelComponent,
  PanelContentDirective,
  PanelDescriptionDirective,
  PanelHeaderComponent,
  PanelTitleDirective,
} from '@dcx/ui/design-system';
import { TextHelperService } from '@dcx/ui/libs';
import { TranslateModule } from '@ngx-translate/core';
import {
  DateHelper,
  RfFormControl,
  RfFormGroup,
  RfFormStore,
  RfInputTextComponent,
  RfPrefixPhoneComponent,
} from 'reactive-forms';

import { TranslationKeys } from '../../core/enum/translation-keys.enum';
import { AccountContactConfig } from '../../core/models/account-contact.config';
import { AccountPersonalConfig } from '../../core/models/account-personal.config';
import { EmergencyContactData } from '../../core/models/emergency-contact-data';
import { MyProfileConfig } from '../../core/models/my-profile.config';
import { SummaryContactData } from '../../core/models/summary-contact-data';
import { AccountContactComponent } from '../account-contact/account-contact.component';
import { accountContactRegex } from '../account-contact/regex/account-contact.regex';
import { AccountPersonalComponent } from '../account-personal/account-personal.component';
import { AccountPersonalInformation } from '../account-personal/models/account-personal-information.model';
import { ProfileEmergencyContactComponent } from '../profile-emergency-contact/profile-emergency-contact.component';

@Component({
  selector: 'my-profile-container',
  imports: [
    TranslateModule,
    AccountPersonalComponent,
    AccountContactComponent,
    ProfileEmergencyContactComponent,
    PanelComponent,
    PanelContentDirective,
    PanelDescriptionDirective,
    PanelHeaderComponent,
    PanelTitleDirective,
  ],
  templateUrl: './my-profile-container.component.html',
  host: { class: 'my-profile-container' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MyProfileContainerComponent implements OnInit {
  public readonly data = input.required<AccountV2Models.AccountDto | null>();
  public readonly config = input.required<MyProfileConfig>();
  public readonly isLoading = input<boolean>(false);
  public readonly formsNames = input.required<Map<string, string>>();

  @Output() public updateAccountPersonalInfo = new EventEmitter<AccountPersonalInformation>();
  @Output() public updateAccountContactInfo = new EventEmitter<SummaryContactData>();
  @Output() public updateProfileEmergencyContact = new EventEmitter<EmergencyContactData>();

  public readonly profileTitleId: string = 'accountProfileTitleId';
  protected parentPanelsConfig: PanelBaseConfig = {
    appearance: PanelAppearance.SHADOW,
  };
  protected accountPersonalConfig = signal<AccountPersonalConfig | null>(null);
  protected accountContactConfig = signal<AccountContactConfig | null>(null);

  protected readonly hasEmergencyContact = signal<boolean>(false);
  protected readonly hasContactInformation = signal<boolean>(false);
  protected readonly translateKeys = TranslationKeys;

  private lastUserData: AccountV2Models.AccountDto | null = null;

  private readonly formStore = inject(RfFormStore);
  private readonly summaryStore = inject(RfFormSummaryStore);
  private readonly textHelperService = inject(TextHelperService);
  private readonly dateHelper = inject(DateHelper);

  constructor() {
    effect(() => {
      const data = this.data();
      const form: RfFormGroup = this.formStore.getFormGroup('formPersonal')!;
      if (!form || this.lastUserData === data || !data) return;
      this.lastUserData = data;
      this.setPersonalData();
      this.setAccountContact();
      this.setEmergencyContact();
    });
  }

  public ngOnInit(): void {
    this.internalInit();
  }

  protected cancelAccountPersonal(): void {
    const formName = this.getAccountPersonalFormName()!;
    this.formStore.getFormGroup(formName)?.markAsUntouched();
  }

  protected cancelAccountContact(): void {
    const formName = this.getAccountContactFormName()!;
    this.formStore.getFormGroup(formName)?.markAsUntouched();
  }

  protected cancelEmergencyContact(): void {
    const formName = this.getEmergencyContactFormName()!;
    this.formStore.getFormGroup(formName)?.markAsUntouched();
  }

  protected onUpdateAccountPersonalInfo(event: AccountPersonalInformation): void {
    this.updateAccountPersonalInfo.emit(event);
  }

  protected onUpdateAccountContactInfo(event: SummaryContactData): void {
    this.updateAccountContactInfo.emit(event);
  }

  protected onUpdateProfileEmergencyContact(event: EmergencyContactData): void {
    this.updateProfileEmergencyContact.emit(event);
  }

  private internalInit(): void {
    this.setFormsConfig();
  }

  private setFormsConfig(): void {
    this.accountPersonalConfig.set({
      countryOptions: this.config().countryOptions,
      parentLabelledById: this.profileTitleId,
      culture: this.config().culture,
      genderOptions: this.config().genderOptions,
      ownLabelledById: 'accountPersonalTitleId',
    } as AccountPersonalConfig);

    this.accountContactConfig.set({
      culture: this.config().culture,
      countryPrefixOptions: this.config().countryPrefixOptions,
      parentLabelledById: this.profileTitleId,
      ownLabelledById: 'accountContactTitleId',
      hideEditDocumentsSection: this.config().hideEditDocumentsSection, // Remove when API is ready
    });
  }

  private setPersonalData(): void {
    const user = this.data();
    const formName = this.getAccountPersonalFormName()!;
    const form: RfFormGroup = this.formStore.getFormGroup(formName)!;
    const gender = user?.gender;
    form
      ?.get('gender')
      ?.setValue((gender === AccountModels.GenderType.Unspecified ? AccountModels.GenderType.Unknown : gender) || '');
    form?.get('name')?.setValue(user?.firstName || '');
    form?.get('lastName')?.setValue(user?.lastName || '');
    form?.get('nationality')?.setValue(user?.nationality || '');
    form?.get('country')?.setValue(user?.addressCountry || '');
    const dateOfBirth = user?.dateOfBirth ? this.dateHelper.parseNaiveUtc(user?.dateOfBirth?.toString()) : null;
    form?.get('birthday')?.setValue({
      day: dateOfBirth?.date() ?? null,
      month: (dateOfBirth?.month() ?? -1) + 1,
      year: dateOfBirth?.year() ?? null,
    });
    form
      ?.get('address')
      ?.setValue(this.textHelperService.concatValidParts([user?.addressLine ?? '', user?.addressLine2 ?? '']));

    this.summaryStore.forceParseConfig(formName);
  }

  private setAccountContact(): void {
    const formName = this.getAccountContactFormName()!;
    const form: RfFormGroup = this.formStore.getFormGroup(formName)!;
    const data = this.data();
    if (!form) return;
    if (data?.communicationChannels?.length) {
      const accountContact = this.getAccountContact();
      form?.get('phoneNumber')?.setValue({ prefix: accountContact.prefix, phone: accountContact.phone });
      form?.get('email')?.setValue(accountContact.email);
    } else {
      form?.get('phoneNumber')?.setValue({ prefix: '', phone: '' });
      form?.get('email')?.setValue('');
    }
    this.setValidatorsAccountContact(form);
    this.summaryStore.forceParseConfig(formName);
  }

  /**
   * Set validators for account contact form
   * @param form The form group to set validators on
   */
  private setValidatorsAccountContact(form: RfFormGroup): void {
    const accountContact = this.getAccountContact();
    const formEmail = form.get('email') as RfFormControl;
    const formValidators: ValidatorFn[] = [Validators.pattern(accountContactRegex.email.validationPattern)];
    if (accountContact?.email.trim()) {
      formValidators.push(Validators.required);
    }
    if (formEmail?.rfComponent instanceof RfInputTextComponent) {
      formEmail.rfComponent.isRequired = !!accountContact?.email.trim();
    }
    if (formEmail?.setValidators) {
      formEmail.setValidators(formValidators);
      formEmail.updateValueAndValidity();
    }
    if (!accountContact?.prefix.trim()) {
      const formControl = form.get('phoneNumber') as RfFormControl;
      const rfPrefixPhoneComponent = formControl.rfComponent as RfPrefixPhoneComponent;
      const prefixPhoneForm = rfPrefixPhoneComponent.form;
      prefixPhoneForm?.get('prefix')?.setValidators([]);
      prefixPhoneForm?.get('prefix')?.updateValueAndValidity();
    }
  }

  private setEmergencyContact(): void {
    const formName = this.getEmergencyContactFormName()!;
    const emergencyContact = this.getEmergencyContact();
    const form: RfFormGroup = this.formStore.getFormGroup(formName)!;
    if (emergencyContact) {
      if (!form) return;
      const fullName = this.textHelperService
        .concatValidParts([emergencyContact.name?.first ?? '', emergencyContact.name?.last ?? ''])
        .replace('Unknown', '')
        .trim();
      form?.get('completeName')?.setValue(fullName);
      const channel = this.getChannelFromEmergencyContact(PersonCommunicationChannelType.Phone);
      const prefix = channel?.prefix;
      const phone = channel?.info;
      form?.get('phoneNumber')?.setValue({ prefix: prefix ?? '', phone: phone ?? '' });
    } else {
      form?.get('completeName')?.setValue('');
      form?.get('phoneNumber')?.setValue({ prefix: '', phone: '' });
    }
    this.summaryStore.forceParseConfig(formName);
  }

  private getChannelFromEmergencyContact(
    type: PersonCommunicationChannelType
  ): AccountV2Models.PersonCommunicationChannelDto | undefined {
    const emergencyContact = this.getEmergencyContact();
    return emergencyContact?.channels?.find((channel) => channel.type?.toString() === type);
  }

  private getCommunicationChannel(
    type: PersonCommunicationChannelType
  ): AccountV2Models.PersonCommunicationChannelDto | undefined {
    return this.data()?.communicationChannels?.find((channel) => channel.type?.toString() === type);
  }

  private getAccountPersonalFormName(): string | undefined {
    return this.formsNames().get('account-personal');
  }

  private getAccountContactFormName(): string | undefined {
    return this.formsNames().get('account-contact');
  }

  private getEmergencyContactFormName(): string | undefined {
    return this.formsNames().get('profile-emergency-contact');
  }

  private getAccountContact(): { prefix: string; phone: string; email: string } {
    const channel = this.getCommunicationChannel(PersonCommunicationChannelType.Phone);
    return {
      prefix: channel?.prefix ?? '',
      phone: channel?.info?.trim() ?? '',
      email: this.getCommunicationChannel(PersonCommunicationChannelType.Email)?.info?.trim() ?? '',
    };
  }

  private getEmergencyContact(): AccountV2Models.ContactDto | undefined {
    return this.data()?.contacts?.find((c) => c.type?.toString() === AccountV2Models.ContactType.Emergency);
  }
}
