import { Component, inject, input, model, OnInit, output, viewChild } from '@angular/core';
import { AccountModels } from '@dcx/module/api-clients';
import {
  FormSummaryButtonsConfig,
  FormSummaryComponent,
  FormSummaryViews,
  RfSelectDatePickerFieldFactoryService,
} from '@dcx/ui/business-common';
import { SummaryBuilderGridConfig } from '@dcx/ui/design-system';
import { TranslateService } from '@ngx-translate/core';
import dayjs from 'dayjs';
import {
  FormBuilderConfig,
  GridBuilderCustomType,
  RfListOption,
  SummaryBuilderAdditions,
} from 'reactive-forms';

import { TranslationKeys } from '../../core/enum/translation-keys.enum';

import { getConfig } from './config/account-companions.config';

@Component({
  selector: 'account-companions',
  imports: [FormSummaryComponent],
  templateUrl: './account-companions.component.html',
  host: { class: 'account-companions' },
})
export class AccountCompanionsComponent implements OnInit {
  // ARIA relationship inputs: allows this component's panel to inherit accessibility context from parent and own title.
  public readonly parentLabelledById = input<string | null>(null);
  public readonly ownLabelledById = input<string | null>(null);
  public cancelForm = output<boolean>();
  public focusEdit = output<boolean>();
  public formSummary = viewChild<FormSummaryComponent>('formSummary');
  public formName = input<string>('');
  public title = model<string>('');
  public secondaryTitle = model<string>('');
  public culture = input.required<string>();
  public updateAccountCompanionsInfo = output<AccountModels.FrequentTravelerDto>();
  public formBuilderConfig = model<FormBuilderConfig>({});
  public summaryGridConfig: SummaryBuilderGridConfig = {
    columns: 2,
    twoColumnsOnMobile: true,
  };
  public additions: SummaryBuilderAdditions = {};
  public subtractions: string[] = ['name', 'lastName'];
  public customFields: GridBuilderCustomType = {
    genderName: { keys: ['gender', 'name'] },
  };
  public buttonsConfig = model<FormSummaryButtonsConfig>();
  public genderOptions = input<RfListOption[]>([]);
  public countryOptions = input<RfListOption[]>([]);
  public hideEditButton = input<boolean>(false);
  protected readonly columns = input<number>(2);
  protected FormSummaryViews = FormSummaryViews;
  private readonly translateService = inject(TranslateService);
  private readonly selectDatePickerFieldFactory = inject(RfSelectDatePickerFieldFactoryService);
  public ngOnInit(): void {
    this.internalInit();
  }

  protected cancelCompanion(existsPreviousData: boolean): void {
    this.cancelForm.emit(existsPreviousData);
  }

  protected saveCompanion(form: any): void {
    if (!form) {
      return;
    }
    const formattedDate = dayjs(form.birthday).format('YYYY-MM-DD');
    const companion = {
      name: {
        first: form.name,
        last: form.lastName,
      } as AccountModels.PersonNameDto,
      address: {
        country: form.country,
      },
      personInfo: {
        gender: form.gender,
        dateOfBirth: formattedDate,
      } as AccountModels.PersonInfoDto,
      loyaltyId: form.lifemilesNumber,
    } as AccountModels.FrequentTravelerDto;

    this.updateAccountCompanionsInfo.emit(companion);
  }

  private createButtonsConfig(): void {
    this.buttonsConfig.set({
      addButton: {
        label: this.translateService.instant(TranslationKeys.AccountProfile_CompanionsForm_AddCompanionButton_Label),
      },
      saveButton: {
        label: this.translateService.instant(TranslationKeys.AccountProfile_ConfirmButton_Label),
        loadingLabel: this.translateService.instant(TranslationKeys.AccountProfile_SavingButton_Label),
      },
      cancelButton: {
        label: this.translateService.instant(TranslationKeys.AccountProfile_CancelButton_Label),
      },
      editButton: {
        label: this.translateService.instant(TranslationKeys.AccountProfile_EditButton_Label),
      },
      hideEditButton: this.hideEditButton(),
    });
  }

  private internalInit(): void {
    const formConfig: FormBuilderConfig = getConfig(
      this.genderOptions(),
      this.countryOptions(),
      this.translateService,
      this.selectDatePickerFieldFactory
    );
    this.formBuilderConfig.set(formConfig);
    this.createButtonsConfig();
    this.createAdditions();
  }

  protected focusEditAction(success: boolean): void {
    this.focusEdit.emit(success);
  }

  private createAdditions(): void {
    this.additions = {
      completeName: {
        label: (): string =>
          this.translateService.instant(TranslationKeys.AccountProfile_CompanionsForm_CompleteName_Label),
        value: (raw: any): string => {
          if (!raw) {
            return '';
          }
          const name = raw.name || '';
          const lastName = raw.lastName || '';
          return `${name} ${lastName}`.trim();
        },
        position: { key: 'birthday' },
      },
    };
  }
}
