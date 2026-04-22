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
  viewChildren,
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
import { ButtonConfig, ButtonStyles, LayoutSize, PaxTypeCode } from '@dcx/ui/libs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import dayjs from 'dayjs';
import {
  DateHelper,
  FormBuilderConfig,
  RfBaseReactiveComponent,
  RfFormControl,
  RfFormGroup,
  RfFormStore,
} from 'reactive-forms';

import { AccountCompanionsConfig } from '../../core/models/account-companions.config';
import { TranslationKeys } from '../../enums/translation-keys.enum';
import { AccountCompanionsComponent } from '../account-companions/account-companions.component';

@Component({
  selector: 'account-companions-container',
  imports: [
    AccountCompanionsComponent,
    TranslateModule,
    DsButtonComponent,
    NgStyle,
    PanelComponent,
    PanelContentDirective,
    PanelDescriptionDirective,
    PanelFooterDirective,
    PanelHeaderComponent,
    PanelTitleDirective,
  ],
  templateUrl: './account-companions-container.component.html',
  styleUrl: './styles/account-companions-container.styles.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountCompanionsContainerComponent implements OnChanges {
  public readonly buttonAdd = viewChild<DsButtonComponent>('buttonAdd');
  public readonly accountCompanion = viewChildren(AccountCompanionsComponent);
  public readonly data = input.required<AccountModels.FrequentTravelerDto[]>();
  public readonly config = input.required<AccountCompanionsConfig>();
  public readonly formsNames = input.required<Map<string, string>>();
  private readonly nvdaIssuesService = inject(NvdaIssuesService);
  private readonly dateHelper = inject(DateHelper);

  @Output() public updateAccountCompanionsInfo = new EventEmitter<{
    form: AccountModels.FrequentTravelerDto;
    index: number;
  }>();

  protected parentPanelsConfig: PanelBaseConfig = {
    appearance: PanelAppearance.SHADOW,
  };

  protected readonly MAX_COMPANIONS = 4;
  protected readonly translationKeys = TranslationKeys;
  protected readonly addButtonCompanion = signal<ButtonConfig>({
    icon: { name: 'plus-circle-filled' },
    label: '',
    layout: {
      style: ButtonStyles.LINK,
      size: LayoutSize.SMALL,
    },
  });
  public maxCompanions: number = this.MAX_COMPANIONS;
  public companionTitles: string[] = [];

  private readonly formStore = inject(RfFormStore);

  private readonly summaryStore = inject(RfFormSummaryStore);
  private readonly changeDetector = inject(ChangeDetectorRef);
  private readonly translateService = inject(TranslateService);
  private readonly accountCompanionsComp = viewChildren(AccountCompanionsComponent);

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && this.data()) {
      this.orderCompanions();
      this.setMaxCompanions();
      this.setCompanionData();
      this.setCompanionTitles();
    }
    if (changes['config']) {
      this.addButtonCompanion.update((config) => ({
        ...config,
        label: this.translateService.instant(
          this.translationKeys.AccountProfile_CompanionsForm_AddCompanionButton_Label
        ),
      }));
      this.setCompanionTitles();
    }
  }

  protected addCompanion(event: MouseEvent): void {
    this.data()?.push({} as AccountModels.FrequentTravelerDto);
    this.setCompanionTitles();
    this.changeDetector.detectChanges();
    requestAnimationFrame(() => {
      const index: number = this.data()?.length - 1;
      const formName = this.getCompanionsFormName();
      this.summaryStore.changeView(formName + index, FormSummaryViews.FORM_BUILDER);

      // Prepare the new frequent traveler to set the names
      const form: RfFormGroup = this.formStore.getFormGroup(formName + index)!;
      const component = this.accountCompanionsComp()[index];
      this.bindSecondaryTitle(form, component);
      if (this.nvdaIssuesService.isEventFromKeyboard(event)) {
        const newCompanionId: string | null = this.lastCompanionsKeyPlusOne(this.formStore.formGroups());
        const formToFocus: RfFormGroup | undefined = this.formStore.getFormGroup(newCompanionId ?? 'Companions0');
        if (this.accountCompanion()[0]?.formBuilderConfig()) {
          const config: FormBuilderConfig = this.accountCompanion()[0].formBuilderConfig();
          const idControlTofocus: string = this.firstKeyFromJsonText(config);
          if (formToFocus) {
            requestAnimationFrame(() => {
              ((formToFocus.get(idControlTofocus) as RfFormControl).rfComponent as RfBaseReactiveComponent)?.focus();
            });
          }
        }
      }
    });
  }

  private firstKeyFromJsonText(json: FormBuilderConfig): string {
    return Object.keys(json)[0];
  }

  private lastCompanionsId(map: Map<string, RfFormGroup>): number | null {
    let max: number | null = null;
    const re = /^Companions(\d+)$/i;

    for (const k of map.keys()) {
      const m = re.exec(k);
      if (m) {
        const n = Number(m[1]);
        if (!Number.isNaN(n) && (max === null || n > max)) max = n;
      }
    }
    return max;
  }

  private lastCompanionsKeyPlusOne(map: Map<string, RfFormGroup>): string | null {
    const id = this.lastCompanionsId(map);
    return id === null ? null : `Companions${id}`;
  }

  private orderCompanions(): void {
    this.data().sort((a, b) => {
      const dateA = a.personInfo?.dateOfBirth || '';
      const dateB = b.personInfo?.dateOfBirth || '';

      if (dateA !== dateB) {
        if (!dateA) return 1;
        if (!dateB) return -1;
        return dateA.localeCompare(dateB);
      }

      const firstNameA = a.name?.first || '';
      const firstNameB = b.name?.first || '';

      if (firstNameA !== firstNameB) {
        return firstNameA.localeCompare(firstNameB);
      }

      const lastNameA = a.name?.last || '';
      const lastNameB = b.name?.last || '';
      return lastNameA.localeCompare(lastNameB);
    });
  }

  protected cancelCompanion(existPreviousData: boolean, index: number): void {
    const formName = this.getCompanionsFormName();
    const companion = this.data()?.[index];
    const existTraveler = Object.keys(companion);
    if (!existTraveler.length || !existPreviousData) {
      this.data()?.pop();
      this.formStore.removeFormGroup(formName + this.data()?.length);
    } else {
      this.formStore.getFormGroup(formName + index)?.markAsUntouched();
    }
  }

  protected areAllCompanionsInSummaryView(): boolean {
    const formName = this.formsNames().get('account-companions');
    if (!formName) {
      return true;
    }
    const summaries = this.summaryStore.summaries();
    const companionKeys = Object.keys(summaries).filter((key) => key.startsWith(formName));
    if (!companionKeys.length) {
      return true;
    }
    return companionKeys.every((key) => summaries[key].selectedTemplate === FormSummaryViews.SUMMARY);
  }

  protected focusEditAction(success: boolean): void {
    if (!success) {
      requestAnimationFrame(() => {
        this.buttonAdd()?.focus();
      });
    }
  }

  protected onUpdateAccountCompanionsInfo(form: AccountModels.FrequentTravelerDto, index: number): void {
    this.updateAccountCompanionsInfo.emit({ form, index });
  }

  protected setMaxCompanions(): void {
    this.maxCompanions = Math.max(this.data()?.length || 0, this.MAX_COMPANIONS);
  }

  protected getCompanionsFormName(): string {
    return this.formsNames().get('account-companions')!;
  }

  protected setCompanionData(): void {
    const formName = this.getCompanionsFormName();
    requestAnimationFrame(() => {
      const data = this.data();
      if (data) {
        for (let i = 0; i < data.length; i++) {
          this.setCompanion(formName, i, data[i]);
        }
      }
    });
  }

  protected setCompanion(formName: string, i: number, companionData: AccountModels.FrequentTravelerDto): void {
    const form: RfFormGroup = this.formStore.getFormGroup(formName + i)!;
    const component = this.accountCompanionsComp()[i];
    const gender = companionData.personInfo?.gender;
    form
      ?.get('gender')
      ?.setValue(gender === AccountModels.GenderType.Unspecified ? AccountModels.GenderType.Unknown : gender);
    form?.get('name')?.setValue(companionData.name?.first);
    form?.get('lastName')?.setValue(companionData.name?.last);
    form?.get('country')?.setValue(companionData.address?.country);
    form
      ?.get('birthday')
      ?.setValue(
        companionData.personInfo?.dateOfBirth
          ? this.dateHelper.parseNaiveUtc(companionData.personInfo?.dateOfBirth?.toString())
          : ''
      );
    form?.get('lifemilesNumber')?.setValue(companionData.loyaltyId ?? '');
    // Set secondaryTitle manually from form values
    this.bindSecondaryTitle(form, component);
    this.summaryStore.forceParseConfig(formName + i);
  }

  private updateSecondaryTitle(form: RfFormGroup, component?: AccountCompanionsComponent): void {
    const name = form?.get('name')?.value?.trim() ?? '';
    const lastName = form?.get('lastName')?.value?.trim() ?? '';
    component?.secondaryTitle.set(`${name} ${lastName}`.trim());
  }

  private bindSecondaryTitle(form: RfFormGroup, component?: AccountCompanionsComponent): void {
    this.updateSecondaryTitle(form, component);

    form?.get('name')?.valueChanges.subscribe((): void => {
      this.updateSecondaryTitle(form, component);
    });

    form?.get('lastName')?.valueChanges.subscribe((): void => {
      this.updateSecondaryTitle(form, component);
    });
  }

  private setCompanionTitles(): void {
    const dataArr = this.data() || [];
    if (!dataArr.length) {
      this.companionTitles = [this.getCompanionTitle(0, {})];
      return;
    }

    const travelerTypesCounts = new Map<string, number>();

    this.companionTitles = dataArr.map((traveler, i) => {
      const dob = traveler?.personInfo?.dateOfBirth;
      const paxType = dob ? this.getTravelerType(dob) : '';

      const currentCount = (travelerTypesCounts.get(paxType) || 0) + 1;
      travelerTypesCounts.set(paxType, currentCount);

      return this.getCompanionTitle(i, { paxType, count: currentCount });
    });
  }

  private getCompanionTitle(index: number, options: { paxType?: string; count?: number }): string {
    const traveler = this.data()?.[index];
    const dob = traveler?.personInfo?.dateOfBirth;

    const paxType = options?.paxType || (dob ? this.getTravelerType(dob) : '');
    const count = options?.count ?? 1;

    const label = paxType
      ? this.translateService.instant(this.getPassengerTypeTranslate(paxType as PaxTypeCode))
      : this.translateService.instant(this.translationKeys.AccountProfile_CompanionsForm_Companion_Label);

    return `${label} ${count}:`;
  }

  private getPassengerTypeTranslate(paxTypeCode: PaxTypeCode): string {
    switch (paxTypeCode) {
      case PaxTypeCode.ADT:
        return this.translationKeys.AccountProfile_CompanionsForm_ADT_Label;
      case PaxTypeCode.CHD:
        return this.translationKeys.AccountProfile_CompanionsForm_CHD_Label;
      case PaxTypeCode.TNG:
        return this.translationKeys.AccountProfile_CompanionsForm_TNG_Label;
      case PaxTypeCode.INF:
        return this.translationKeys.AccountProfile_CompanionsForm_INF_Label;
      default:
        return '';
    }
  }

  private getAge(dateOfBirth: string): number {
    const today = dayjs();
    const birthDate = dayjs(dateOfBirth);
    return today.diff(birthDate, 'year');
  }

  private getTravelerType(dateOfBirth: string): PaxTypeCode {
    const age = this.getAge(dateOfBirth);

    if (age >= 15) return PaxTypeCode.ADT;
    if (age >= 12 && age <= 14) return PaxTypeCode.TNG;
    if (age >= 2 && age <= 11) return PaxTypeCode.CHD;
    return PaxTypeCode.INF;
  }
}
