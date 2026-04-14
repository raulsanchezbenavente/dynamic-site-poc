import { Component, effect, inject, input, model, OnInit, output, signal } from '@angular/core';
import { AccountModels, AccountV2Models } from '@dcx/module/api-clients';
import {
  FormSummaryButtonsConfig,
  FormSummaryComponent,
  FormSummaryViews,
  RfFormSummaryStore,
  RfSelectDatePickerFieldFactoryService,
} from '@dcx/ui/business-common';
import { TranslateService } from '@ngx-translate/core';
import { FormBuilderConfig, RfFormStore, RfListOption, RfSelectField } from 'reactive-forms';

import { TranslationKeys } from '../../core/enum/translation-keys.enum';

import { getConfig } from './config/account-documents.config';
@Component({
  selector: 'account-profile-documents',
  templateUrl: './account-documents.component.html',
  host: { class: 'account-documents' },
  imports: [FormSummaryComponent],
  standalone: true,
})
export class AccountProfileDocumentsComponent implements OnInit {
  // ARIA relationship inputs: allows this component's panel to inherit accessibility context from parent and own title.
  public readonly parentLabelledById = input<string | null>(null);
  public readonly ownLabelledById = input<string | null>(null);
  public cancelForm = output<boolean>();
  public focusEdit = output<boolean>();
  public title = model<string>('');
  public formName = input<string>('');
  public culture = input.required<string>();
  public updateAccountDocumentsInfo = output<AccountModels.PersonDocumentDto>();
  public formBuilderConfig = model<FormBuilderConfig>({});
  public formBuilderConfigForUpdates = model<FormBuilderConfig>({});
  public buttonsConfig = model<FormSummaryButtonsConfig>();
  public documentOptions = input<RfListOption[]>([]);
  public countryOptions = input<RfListOption[]>([]);
  public hasDocuments = input.required<boolean>();
  protected readonly translateKeys = TranslationKeys;
  protected columns = input<number>(2);
  protected subtractions: string[] = [];
  protected FormSummaryViews = FormSummaryViews;
  private readonly translateService = inject(TranslateService);
  private readonly selectDatePickerFieldFactory = inject(RfSelectDatePickerFieldFactoryService);
  private readonly formStore = inject(RfFormStore);
  private readonly summaryStore = inject(RfFormSummaryStore);
  private readonly documentTypeControlName = 'documentType';
  private readonly expirationDateControlName = 'documentExpirationDate';
  private readonly summaryControlId = signal<string>('');
  private readonly formControlId = signal<string>('');

  constructor() {
    effect(() => {
      const formGroup = this.formStore.getFormGroup(this.formName());
      const docTypeControl = formGroup?.get(this.documentTypeControlName);

      docTypeControl?.valueChanges.subscribe((value: string) => {
        this.updateDocumentVisibility(value);
      });

      const view = this.summaryStore.getSelectedView(this.formName());

      if (view() === FormSummaryViews.FORM_BUILDER) {
        this.formBuilderConfig.update((config) => {
          const documentType = config['documentType'] as RfSelectField;
          documentType.readonly = !!docTypeControl?.value;
          return config;
        });
      }
    });
  }

  public ngOnInit(): void {
    this.internalInit();
  }

  protected cancelDocumentEdit(existsPreviousData: boolean): void {
    this.cancelForm.emit(existsPreviousData);
  }

  protected saveDocumentEdit(form: any): void {
    if (!form) {
      return;
    }

    const documentToSave = {
      type: form.documentType,
      number: form.documentNumber,
      issuedCountry: form.documentNationality,
      expirationDate: form.documentExpirationDate,
    } as AccountModels.PersonDocumentDto;

    this.updateAccountDocumentsInfo.emit(documentToSave);
  }

  protected focusEditAction(success: boolean): void {
    this.focusEdit.emit(success);
  }

  private createButtonsConfig(): void {
    this.buttonsConfig.set({
      addButton: {
        label: this.translateService.instant(this.translateKeys.AccountProfile_DocumentsForm_AddDocumentButton_Label),
      },
      saveButton: {
        label: this.translateService.instant(this.translateKeys.AccountProfile_ConfirmButton_Label),
        loadingLabel: this.translateService.instant(this.translateKeys.AccountProfile_SavingButton_Label),
      },
      cancelButton: {
        label: this.translateService.instant(this.translateKeys.AccountProfile_CancelButton_Label),
      },
      editButton: {
        label: this.translateService.instant(this.translateKeys.AccountProfile_EditButton_Label),
      },
    });
  }

  private internalInit(): void {
    const formConfig: FormBuilderConfig = getConfig(
      this.documentOptions(),
      this.countryOptions(),
      this.selectDatePickerFieldFactory,
      this.translateService
    );
    this.formBuilderConfig.set(formConfig);
    this.createButtonsConfig();
    this.setControlIds();
  }

  private setControlIds(): void {
    this.summaryControlId.set(`[data-summary-control-name-id="${this.formName()}-${this.expirationDateControlName}"]`);
    this.formControlId.set(`[data-form-control-name-id="${this.formName()}-${this.expirationDateControlName}"]`);
  }

  private updateDocumentVisibility(value: string): void {
    const formElement: HTMLElement | null = document.querySelector(this.formControlId());
    this.toggleHiddenClass(formElement, value);
  }

  private toggleHiddenClass(element: HTMLElement | null, value: string): void {
    if (!element) return;
    const dateExpirationControl = this.formStore.getFormGroup(this.formName())!.get(this.expirationDateControlName);

    if (value === AccountV2Models.DocumentType.I) {
      this.subtractions = [this.expirationDateControlName];
      dateExpirationControl!.disable();
    }
    if (value === AccountV2Models.DocumentType.P) {
      this.subtractions = [];
      dateExpirationControl!.enable();
    }
  }
}
