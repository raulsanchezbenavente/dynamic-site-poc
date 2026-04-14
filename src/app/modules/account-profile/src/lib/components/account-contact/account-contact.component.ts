import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  model,
  OnInit,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { FormSummaryButtonsConfig, FormSummaryComponent, FormSummaryViews } from '@dcx/ui/business-common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FormBuilderConfig } from 'reactive-forms';

import { TranslationKeys } from '../../core/enum/translation-keys.enum';
import { AccountContactConfig } from '../../core/models/account-contact.config';
import { SummaryContactData } from '../../core/models/summary-contact-data';

import { getConfig } from './config/account-contact.config';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'account-contact',
  templateUrl: './account-contact.component.html',
  host: { class: 'account-contact' },
  imports: [TranslateModule, FormSummaryComponent],
  standalone: true,
})
export class AccountContactComponent implements OnInit {
  // ARIA relationship inputs: allows this component's panel to inherit accessibility context from parent and own title.
  public parentLabelledById = signal<string | null>(null);
  public ownLabelledById = signal<string | null>(null);
  public readonly formName = input.required<string>();

  public formSummary = viewChild<FormSummaryComponent>('formSummary');
  public isLoading = input<boolean>(false);
  public cancelForm = output<boolean>();
  public readonly config = input.required<AccountContactConfig>();
  public updateAccountContactInfo = output<SummaryContactData>();
  public formBuilderConfig = model<FormBuilderConfig>({});
  public buttonsConfig = model<FormSummaryButtonsConfig>();
  protected formId!: string;
  protected FormSummaryViews = FormSummaryViews;
  protected readonly columns = input<number>(2);
  protected readonly translateKeys = TranslationKeys;
  private readonly translateService = inject(TranslateService);

  public ngOnInit(): void {
    this.internalInit();
  }

  protected saveContact(form: any): void {
    if (!form) {
      return;
    }
    const contact: SummaryContactData = {
      prefix: form.phoneNumber?.prefix ?? '',
      number: form.phoneNumber?.phone ?? '',
      email: form.email,
    };

    this.updateAccountContactInfo.emit(contact);
  }

  protected cancelAccountContact(existsPreviousData: boolean): void {
    this.cancelForm.emit(existsPreviousData);
  }

  private createButtonsConfig(): void {
    this.buttonsConfig.set({
      addButton: {
        label: this.translateService.instant(
          TranslationKeys.AccountProfile_ContactForm_AddContactInformationButton_Label
        ),
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
      hideEditButton: this.config().hideEditDocumentsSection ?? false, //remove when API is ready
    });
  }

  private internalInit(): void {
    this.createButtonsConfig();
    const formConfig: FormBuilderConfig = getConfig(this.config().countryPrefixOptions, this.translateService);
    this.formBuilderConfig.set(formConfig);
    this.parentLabelledById.set(this.config().parentLabelledById);
    this.ownLabelledById.set(this.config().ownLabelledById);
  }
}
