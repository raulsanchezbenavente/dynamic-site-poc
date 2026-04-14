import { Component, inject, input, model, OnInit, output, signal, viewChild } from '@angular/core';
import { FormSummaryButtonsConfig, FormSummaryComponent, FormSummaryViews } from '@dcx/ui/business-common';
import { SummaryDataRenderer } from '@dcx/ui/design-system';
import { TextHelperService } from '@dcx/ui/libs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FormBuilderConfig, RfErrorDisplayModes, RfFormStore, RfInputField, RfListOption } from 'reactive-forms';

import { TranslationKeys } from '../../core/enum/translation-keys.enum';
import { EmergencyContactData } from '../../core/models/emergency-contact-data';

import { getEmergencyFormConfig } from './configs/emergency-contact.config';

@Component({
  selector: 'profile-emergency-contact',
  imports: [TranslateModule, FormSummaryComponent],
  templateUrl: './profile-emergency-contact.component.html',
  styleUrl: './styles/profile-emergency-contact.styles.scss',
})
export class ProfileEmergencyContactComponent implements OnInit {
  // ARIA relationship inputs: allows this component's panel to inherit accessibility context from parent and own title.
  public readonly parentLabelledById = input<string | null>(null);
  public readonly ownLabelledById = input<string | null>(null);
  public readonly formName = input.required<string>();

  public cancelForm = output<boolean>();
  public prefixOptions = input<RfListOption[]>([]);
  public formBuilderConfig = signal<FormBuilderConfig>({});
  public culture = input.required<string>();
  public bypassConfigToReplace: Record<string, unknown> = {};
  public bypassConfigSummaryToCreator: Record<string, SummaryDataRenderer> = {};
  public buttonsConfig = model<FormSummaryButtonsConfig>();
  public previousValues: Map<string, EmergencyContactData> = new Map<string, EmergencyContactData>();
  public isLoading = input<boolean>(false);
  public formSummary = viewChild<FormSummaryComponent>('formSummary');
  public updateProfileEmergencyContact = output<EmergencyContactData>();
  protected readonly columns = input<number>(2);
  protected readonly translateKeys = TranslationKeys;

  protected displayErrorMode = RfErrorDisplayModes.TOUCHED;
  protected FormSummaryViews = FormSummaryViews;

  private readonly completeNameFieldName = 'completeName';

  private readonly translateService = inject(TranslateService);
  private readonly formStore = inject(RfFormStore);
  private readonly textHelperService = inject(TextHelperService);

  public ngOnInit(): void {
    this.internalInit();
  }

  protected saveEmergencyContact(form: any): void {
    if (!form) {
      return;
    }

    const emergencyContact: EmergencyContactData = {
      firstName: form.completeName.trim(),
      lastName: 'Unknown',
      email: form.email ?? '',
      number: form.phoneNumber.phone,
      prefix: form.phoneNumber.prefix,
    };

    this.updateProfileEmergencyContact.emit(emergencyContact);
  }

  protected cancelEmergencyContact(existsPreviousData: boolean): void {
    this.cancelForm.emit(existsPreviousData);
  }

  private internalInit(): void {
    this.createButtonsConfig();
    const config = getEmergencyFormConfig(this.prefixOptions(), this.translateService);
    (config[this.completeNameFieldName] as RfInputField).blurInputText = (value: string): void => {
      const form = this.formStore.getFormGroup(this.formName())!;
      form.get(this.completeNameFieldName)?.setValue(this.textHelperService.normalizeTextSpacing(value));
      form.get(this.completeNameFieldName)?.updateValueAndValidity();
    };
    this.formBuilderConfig.set(config);
  }

  private createButtonsConfig(): void {
    this.buttonsConfig.set({
      addButton: {
        label: this.translateService.instant(
          this.translateKeys.AccountProfile_EmergencyForm_AddEmergencyContactButton_Label
        ),
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
}
