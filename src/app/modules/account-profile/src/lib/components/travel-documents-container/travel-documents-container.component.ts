import { NgStyle } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  inject,
  input,
  OnChanges,
  Output,
  signal,
  SimpleChanges,
  viewChild,
} from '@angular/core';
import { AccountModels } from '@dcx/module/api-clients';
import { FormSummaryViews, NvdaIssuesService, RfFormSummaryStore } from '@dcx/ui/business-common';
import {
  DsButtonComponent,
  PanelAppearance,
  PanelBaseConfig,
  PanelComponent,
  PanelContentDirective,
  PanelDescriptionDirective,
  PanelFooterDirective,
  PanelHeaderComponent,
  PanelTitleDirective,
} from '@dcx/ui/design-system';
import { ButtonConfig, ButtonStyles, LayoutSize } from '@dcx/ui/libs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {
  DateHelper,
  RfBaseReactiveComponent,
  RfFormControl,
  RfFormGroup,
  RfFormStore,
  RfListOption,
} from 'reactive-forms';

import { TranslationKeys } from '../../core/enum/translation-keys.enum';
import { TravelDocumentsConfig } from '../../core/models/travel-documents.config';
import { AccountProfileDocumentsComponent } from '../account-documents/account-documents.component';

@Component({
  selector: 'travel-documents-container',
  imports: [
    AccountProfileDocumentsComponent,
    TranslateModule,
    NgStyle,
    DsButtonComponent,
    PanelComponent,
    PanelContentDirective,
    PanelDescriptionDirective,
    PanelFooterDirective,
    PanelHeaderComponent,
    PanelTitleDirective,
  ],
  templateUrl: './travel-documents-container.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TravelDocumentsContainerComponent implements OnChanges {
  public readonly buttonAdd = viewChild<DsButtonComponent>('buttonAdd');
  public readonly config = input.required<TravelDocumentsConfig>();
  public readonly data = input.required<AccountModels.PersonDocumentDto[]>();
  public readonly formsNames = input.required<Map<string, string>>();
  private readonly nvdaIssuesService = inject(NvdaIssuesService);
  private readonly dateHelper = inject(DateHelper);

  @Output() public updateAccountDocumentsInfo = new EventEmitter<{
    form: AccountModels.PersonDocumentDto;
    index: number;
  }>();

  protected parentPanelsConfig: PanelBaseConfig = {
    appearance: PanelAppearance.SHADOW,
  };

  protected readonly MAX_DOCUMENTS = 2;
  protected readonly translateKeys = TranslationKeys;
  protected readonly hasDocuments = signal<boolean>(true);
  protected readonly addButtonDocument = signal<ButtonConfig>({
    icon: { name: 'plus-circle-filled' },
    label: '',
    layout: {
      style: ButtonStyles.LINK,
      size: LayoutSize.SMALL,
    },
  });

  public documents = signal<AccountModels.PersonDocumentDto[]>([]);
  private readonly formStore = inject(RfFormStore);
  private readonly summaryStore = inject(RfFormSummaryStore);
  protected anyFormBuilderActive = this.summaryStore.isAnyFormBuilderActive();
  private readonly changeDetector = inject(ChangeDetectorRef);
  private readonly translate = inject(TranslateService);

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && this.data()) {
      this.documents.set(this.data());
      this.setTravelDocuments(this.data());
    }
    if (changes['config']) {
      this.addButtonDocument.update((config) => ({
        ...config,
        label: this.translate.instant(this.translateKeys.AccountProfile_DocumentsForm_AddDocumentButton_Label),
      }));
    }
  }

  protected onAddDocument(event: MouseEvent): void {
    this.documents().push({} as AccountModels.PersonDocumentDto);
    this.changeDetector.detectChanges();
    requestAnimationFrame(() => {
      const index: number = this.documents().length - 1;
      const formName = this.getDocumentsFormName();
      this.summaryStore.changeView(formName + index, FormSummaryViews.FORM_BUILDER);
      if (this.nvdaIssuesService.isEventFromKeyboard(event)) {
        const newTravelDocumentId: string | null = formName + index;
        const formToFocus: RfFormGroup | undefined = this.formStore.getFormGroup(newTravelDocumentId ?? 'Documents0');
        const idControlTofocus: string = 'documentType';
        if (formToFocus) {
          requestAnimationFrame(() => {
            ((formToFocus.get(idControlTofocus) as RfFormControl).rfComponent as RfBaseReactiveComponent)?.focus();
          });
        }
      }
    });
  }

  protected onCancelDocument(existPreviousData: boolean, index: number): void {
    const formName = this.getDocumentsFormName();
    const document = this.documents()[index];
    const existDocument = Object.keys(document);
    if (!existDocument.length || !existPreviousData) {
      this.documents().pop();
      this.formStore.removeFormGroup(formName + this.documents().length);
    } else {
      this.formStore.getFormGroup(formName + index)?.markAsUntouched();
    }
  }

  protected focusEditAction(success: boolean): void {
    if (!success) {
      requestAnimationFrame(() => {
        this.buttonAdd()?.focus();
      });
    }
  }

  protected onUpdateAccountDocumentsInfo(form: AccountModels.PersonDocumentDto, index: number): void {
    this.updateAccountDocumentsInfo.emit({ form, index });
  }

  private getDocumentsFormName(): string {
    return this.formsNames().get('account-profile-documents')!;
  }

  private setTravelDocuments(documents: AccountModels.PersonDocumentDto[] = []): void {
    const formName = this.getDocumentsFormName();
    requestAnimationFrame(() => {
      for (const [i, doc] of documents.entries()) {
        this.setDocument(formName, i, doc);
      }
    });
  }

  public filterDocumentOptions(options: RfListOption[], selectedType: string | undefined): RfListOption[] {
    if (selectedType) {
      return options;
    }
    return options.filter((option) => option.value !== this.documents()[0]?.type);
  }

  private setDocument(formName: string, index: number, document: AccountModels.PersonDocumentDto): void {
    const form: RfFormGroup = this.formStore.getFormGroup(formName + index)!;
    if (form) {
      form.get('documentType')?.setValue(document.type);
      form.get('documentNumber')?.setValue(document.number);
      form.get('documentNationality')?.setValue(document.issuedCountry);
      const expirationDate = document?.expirationDate
        ? this.dateHelper.parseNaiveUtc(document?.expirationDate?.toString())
        : null;
      if (expirationDate) {
        form?.get('documentExpirationDate')?.setValue({
          day: expirationDate?.date() ?? null,
          month: (expirationDate?.month() ?? -1) + 1,
          year: expirationDate?.year() ?? null,
        });
      }
      this.summaryStore.forceParseConfig(formName + index);
    }
  }
}
