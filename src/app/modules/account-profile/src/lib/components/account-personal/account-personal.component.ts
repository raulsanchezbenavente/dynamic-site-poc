import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  model,
  OnInit,
  output,
  signal,
  viewChild,
} from '@angular/core';
import {
  FormSummaryButtonsConfig,
  FormSummaryComponent,
  FormSummaryViews,
  RfSelectDatePickerFieldFactoryService,
} from '@dcx/ui/business-common';
import { SummaryBuilderGridConfig, SummaryDataRenderer } from '@dcx/ui/design-system';
import { EnumSeparators, TextHelperService } from '@dcx/ui/libs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FormBuilderConfig, GridBuilderCustomType, RfErrorDisplayModes, SummaryBuilderAdditions } from 'reactive-forms';

import { AccountPersonalConfig } from '../../core/models/account-personal.config';
import { PersonalInformation } from '../../core/models/personal-information';
import { TranslationKeys } from '../../enums/translation-keys.enum';

import { getConfig } from './config/account-personal.config';
import { AccountPersonalInformation } from './models/account-personal-information.model';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'account-personal',
  templateUrl: './account-personal.component.html',
  host: { class: 'account-personal' },
  imports: [TranslateModule, FormSummaryComponent],
  standalone: true,
})
export class AccountPersonalComponent implements OnInit {
  public cancelForm = output<boolean>();
  public readonly config = input.required<AccountPersonalConfig>();
  public readonly formName = input.required<string>();
  // ARIA relationship inputs: allows this component's panel to inherit accessibility context from parent and own title.
  public parentLabelledById = signal<string | null>(null);
  public ownLabelledById = signal<string | null>(null);
  public formBuilderConfig = model<FormBuilderConfig>({});
  public formSummary = viewChild<FormSummaryComponent>('formSummary');
  public bypassConfigToReplace: Record<string, any> = {};
  public bypassConfigSummaryToCreator: Record<string, SummaryDataRenderer> = {};
  public summaryGridConfig: SummaryBuilderGridConfig = {
    columns: 2,
    twoColumnsOnMobile: true,
  };
  public buttonsConfig = model<FormSummaryButtonsConfig>();
  public additions: SummaryBuilderAdditions = {
    completeName: {
      label: () =>
        `${this.translateService.instant(TranslationKeys.AccountProfile_PersonalForm_Name_Label)} / ${this.translateService.instant(TranslationKeys.AccountProfile_PersonalForm_LastName_Label)}`,
      value: (data: any) => {
        const fullName = this.textHelperService.getCapitalizeWords(`${data?.name ?? ''} ${data?.lastName ?? ''}`);
        return fullName ?? EnumSeparators.DASH;
      },
      position: { key: 'birthday' },
    },
  };
  public subtractions: string[] = ['name', 'lastName'];
  public isLoading = input<boolean>(false);
  public customFields: GridBuilderCustomType = {
    genderName: { keys: ['gender', 'name'] },
  };
  public savedData = model<PersonalInformation>();
  public updateAccountPersonalInfo = output<AccountPersonalInformation>();
  protected readonly translationKeys = TranslationKeys;

  protected selectedTemplate: string = FormSummaryViews.FORM_BUILDER;
  protected displayErrorMode = RfErrorDisplayModes.TOUCHED;
  protected sharedConfig!: FormBuilderConfig;
  protected columns = input<number>(2);
  protected defaultSpan = input<number>(6);
  protected customSpans = input<Record<string, number>>();
  protected FormSummaryViews = FormSummaryViews;
  private readonly translateService = inject(TranslateService);
  private readonly textHelperService = inject(TextHelperService);
  private readonly selectDatePickerFieldFactory = inject(RfSelectDatePickerFieldFactoryService);

  constructor() {
    effect(() => {
      const formSummaryInstance = this.formSummary();
      if (!formSummaryInstance) return;

      const layoutSwapperInstance = formSummaryInstance.layoutSwapper();
      if (!layoutSwapperInstance) return;
      const formConfig: FormBuilderConfig = getConfig(
        this.config().genderOptions,
        this.config().countryOptions,
        this.translateService,
        this.config().culture,
        this.selectDatePickerFieldFactory
      );
      this.formBuilderConfig.set(formConfig);
    });
  }
  public ngOnInit(): void {
    this.internalInit();
  }

  public onSaveForm(personalData: any): void {
    const accountPersonalInformation: AccountPersonalInformation = {
      gender: personalData.gender,
      firstName: personalData.name,
      lastName: personalData.lastName,
      addressCountry: personalData.country,
      nationality: personalData.nationality,
      //city: personalData.city,
      birthday: {
        day: personalData.birthday.day,
        month: personalData.birthday.month,
        year: personalData.birthday.year,
      },
      address: personalData.address,
    };

    this.updateAccountPersonalInfo.emit(accountPersonalInformation);
  }

  protected cancelAccountPersonal(existsPreviousData: boolean): void {
    this.cancelForm.emit(existsPreviousData);
  }

  private createButtonsConfig(): void {
    this.buttonsConfig.set({
      addButton: {
        label: this.translateService.instant(
          this.translationKeys.AccountProfile_PersonalForm_AddPersonalInformationButton_Label
        ),
      },
      saveButton: {
        label: this.translateService.instant(this.translationKeys.AccountProfile_ConfirmButton_Label),
        loadingLabel: this.translateService.instant(this.translationKeys.AccountProfile_SavingButton_Label),
      },
      cancelButton: {
        label: this.translateService.instant(this.translationKeys.AccountProfile_CancelButton_Label),
      },
      editButton: {
        label: this.translateService.instant(this.translationKeys.AccountProfile_EditButton_Label),
      },
    });
  }

  private internalInit(): void {
    this.createButtonsConfig();
    this.parentLabelledById.set(this.config().parentLabelledById);
    this.ownLabelledById.set(this.config().ownLabelledById);
  }
}
