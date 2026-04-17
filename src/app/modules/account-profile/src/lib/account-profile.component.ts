import { HttpClient } from '@angular/common/http';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    DestroyRef,
    effect,
    ElementRef,
    inject,
    input,
    signal,
    viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AnalyticsService } from '@dcx/module/analytics';
import { AccountClient, AccountModels, AccountV2Client, AccountV2Models } from '@dcx/module/api-clients';
import { MODULE_TRANSLATION_MAP, TranslationLoadStatusDirective } from '@dcx/module/translation';
import {
    AnalyticsDataType,
    AnalyticsEventType,
    AnalyticsPages,
    AnalyticsUserType,
    BaseItemsMapper,
    CountryMapperService,
    CountryResult,
    FormSummaryViews,
    GenderMapperService,
    GlobalLoaderService,
    PhoneCountryService,
    RfFormSummaryStore,
    SessionModals,
} from '@dcx/ui/business-common';
import {
    mapModalRepositoryConfigToModalDialogConfig,
    ModalDialogConfig,
    ModalDialogService,
    ModalDialogSize,
    PanelAppearance,
    PanelBaseConfig,
    Toast,
    ToastContainerComponent,
    ToastService,
    ToastStatus,
} from '@dcx/ui/design-system';
import {
    AuthService,
    ButtonConfig,
    ButtonStyles,
    CommonConfig,
    ComposerEvent,
    ComposerEventStatusEnum,
    ComposerEventTypeEnum,
    ComposerService,
    ComposerStatusEnum,
    ConfigService,
    CookieService,
    CultureServiceEx,
    DataModule,
    LayoutSize,
    LoggerService,
    PointOfSaleService,
} from '@dcx/ui/libs';
import { DynamicPageReadinessBase, DynamicPageReadyState } from '@dynamic-composite';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import dayjs from 'dayjs';
import { DateHelper, RfFormStore, RfListOption } from 'reactive-forms';
import { catchError, filter, forkJoin, Observable, of, Subscription, take, tap, timeout } from 'rxjs';

import { AccountCompanionsContainerComponent } from './components/account-companions-container/account-companions-container.component';
import { AccountPersonalInformation } from './components/account-personal/models/account-personal-information.model';
import { MyProfileContainerComponent } from './components/my-profile-container/my-profile-container.component';
import { TravelDocumentsContainerComponent } from './components/travel-documents-container/travel-documents-container.component';
import { AccountProfileModals } from './core/enum/account-profile-modals.enum';
import { CookiesKeys } from './core/enum/cookies-keys.enum';
import { ErrorCodesAsyncValidators } from './core/enum/error-codes.enum';
import { TranslationKeys } from './core/enum/translation-keys.enum';
import { AccountCompanionsConfig } from './core/models/account-companions.config';
import { AccountProfileConfig } from './core/models/account-profile-config';
import { EmergencyContactData } from './core/models/emergency-contact-data';
import { MyProfileConfig } from './core/models/my-profile.config';
import { PersonalInformation } from './core/models/personal-information';
import { SummaryContactData } from './core/models/summary-contact-data';
import { TravelDocumentsConfig } from './core/models/travel-documents.config';

@Component({
  selector: 'account-profile',
  templateUrl: './account-profile.component.html',
  styleUrls: ['./styles/account-profile.styles.scss'],
  host: { class: 'account-profile' },
  imports: [
    TranslateModule,
    MyProfileContainerComponent,
    TravelDocumentsContainerComponent,
    AccountCompanionsContainerComponent,
    TranslationLoadStatusDirective,
    ToastContainerComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class AccountProfileComponent extends DynamicPageReadinessBase {
  public baseConfig = input<{ url: string } | null>(null);
  public readonly config = signal<AccountProfileConfig>({} as AccountProfileConfig);
  protected readonly translateKeys = TranslationKeys;
  protected readonly formsNames: Map<string, string> = new Map([
    ['account-personal', 'formPersonal'],
    ['account-contact', 'contact'],
    ['profile-emergency-contact', 'formAccountEmergency'],
    ['account-profile-documents', 'Documents'],
    ['account-companions', 'Companions'],
  ]);
  protected userData = signal<AccountV2Models.AccountDto | null>(null);
  protected isLoading = signal<boolean>(true);
  protected parentPanelsConfig: PanelBaseConfig = {
    appearance: PanelAppearance.SHADOW,
  };
  protected myProfileConfig = signal<MyProfileConfig | null>(null);
  protected travelDocumentsConfig = signal<TravelDocumentsConfig | null>(null);
  protected accountCompanionsConfig = signal<AccountCompanionsConfig | null>(null);
  protected countryOptions = signal<RfListOption[]>([]);
  protected countryPrefixOptions = signal<RfListOption[]>([]);
  protected genderOptions: RfListOption[] = [];
  protected documentOptions = signal<RfListOption[]>([]);
  protected contactData = signal<SummaryContactData>({} as SummaryContactData);
  protected personaInfoData = signal<PersonalInformation>({} as PersonalInformation);
  protected companionsData = signal<AccountModels.FrequentTravelerDto[]>([]);
  protected documentsAllowed = signal<AccountModels.PersonDocumentDto[]>([]);
  protected documentsNotAllowed = signal<AccountModels.PersonDocumentDto[]>([]);
  protected buttonsConfig = new Map<string, ButtonConfig>();
  protected myProfileContainer = viewChild<MyProfileContainerComponent>('myProfileContainer');

  protected composer = inject(ComposerService);
  protected logger = inject(LoggerService);
  protected configService = inject(ConfigService);
  protected elementRef = inject(ElementRef);
  private readonly countryMapperService = inject(CountryMapperService);
  private readonly genderMapperService = inject(GenderMapperService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly data = signal<DataModule>(this.configService.getDataModuleId(this.elementRef));
  private readonly accountClient = inject(AccountClient);
  private readonly accountClientV2 = inject(AccountV2Client);
  private readonly formSummaryStore = inject(RfFormSummaryStore);
  private readonly formStore = inject(RfFormStore);
  private readonly hasEmergencyContact = signal<boolean>(false);
  private readonly translateService = inject(TranslateService);
  private readonly authService = inject(AuthService);
  private readonly globalLoaderService = inject(GlobalLoaderService);
  private readonly cultureServiceEx = inject(CultureServiceEx);
  private readonly phoneCountryService = inject(PhoneCountryService);
  private communicationChannel: AccountModels.PersonCommunicationChannelDto[] = [];
  private previousCountry: string = '';
  private readonly analyticsService = inject(AnalyticsService);
  private readonly toastService = inject(ToastService);
  private readonly modalDialogService = inject(ModalDialogService);
  private readonly pointOfSaleService = inject(PointOfSaleService);
  private readonly cookiesService = inject(CookieService);
  private readonly baseItemsMapper = inject(BaseItemsMapper);
  private readonly dateHelper = inject(DateHelper);
  private readonly CMSKey = 'AccountProfile';
  protected readonly mappedKeys = MODULE_TRANSLATION_MAP[this.CMSKey];
  private readonly http = inject(HttpClient);
  private hasInitializedInternalInit = false;
  private reloadSubscription: Subscription | null = null;

  private readonly registerEffect = effect(() => {
    this.communicationChannel = this.userData()?.communicationChannels ?? [];
    for (const channel of this.userData()?.communicationChannels ?? []) {
      this.setSuffixPrefix(channel);
    }
    for (const contact of this.userData()?.contacts ?? []) {
      for (const channel of contact?.channels ?? []) {
        this.setSuffixPrefix(channel);
      }
    }
  });

  private readonly translationsLoadedLogEffect = effect(() => {
    const loaded = this.dynamicPageTranslationsLoaded();
    if (!loaded) {
      this.hasInitializedInternalInit = false;
      return;
    }
    if (!this.hasInitializedInternalInit) {
      this.hasInitializedInternalInit = true;
      this.translationsLoaded();
    }
  });

  private setSuffixPrefix(channel: AccountModels.PersonCommunicationChannelDto): void {
    if (channel?.type === 'Phone' && channel?.info && channel?.prefix) {
      const countryCodeResult: CountryResult = this.phoneCountryService.countryFromPrefix(channel.prefix, channel.info);
      const countryCode: string = typeof countryCodeResult === 'string' ? countryCodeResult : countryCodeResult[0];
      const suffixCountry: string = countryCode ? '-' + countryCode : '';
      const prefix: string = channel.prefix + suffixCountry;
      channel.prefix = prefix;
    }
  }

  public translationsLoaded(): void {
    this.setDocumentOptions();
    this.cdr.markForCheck();
    this.reloadSubscription?.unsubscribe();
    const sub = new Subscription();
    this.reloadSubscription = sub;
    sub.add(
      forkJoin([this.initConfig(), this.getBusinessConfig()])
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            this.resolveAuthenticationAndLoadData();
          },
          error: (err) => {
            this.logger.error('Error loading data', err);
            this.onDataLoadComplete();
          },
        })
    );
  }

  private resolveAuthenticationAndLoadData(): void {
    const isAuthenticatedSync = this.authService.isAuthenticated?.();
    if (isAuthenticatedSync === true) {
      this.handleAuthenticated();
      return;
    }

    this.reloadSubscription?.add(
      this.authService
        .isAuthenticatedKeycloak$()
        .pipe(
          filter((v): v is boolean => typeof v === 'boolean'),
          take(1),
          timeout({ first: 1500 }),
          catchError(() => of(true)),
          takeUntilDestroyed(this.destroyRef)
        )
        .subscribe((isAuthenticated) => {
          if (isAuthenticated) {
            this.handleAuthenticated();
            return;
          }
          this.handleUnauthenticated();
        })
    );
  }

  public resetComponentStateAndRestart(): void {
    this.reloadSubscription?.unsubscribe();
    this.hasInitializedInternalInit = false;
    this.isLoading.set(true);
    this.userData.set(null);
    this.contactData.set({} as SummaryContactData);
    this.personaInfoData.set({} as PersonalInformation);
    this.companionsData.set([]);
    this.documentsAllowed.set([]);
    this.documentsNotAllowed.set([]);
    this.countryOptions.set([]);
    this.countryPrefixOptions.set([]);
    this.documentOptions.set([]);
    this.myProfileConfig.set(null);
    this.travelDocumentsConfig.set(null);
    this.accountCompanionsConfig.set(null);
    this.hasEmergencyContact.set(false);
    this.cdr.markForCheck();

    queueMicrotask(() => {
      this.translationsLoaded();
    });
  }

  // Idempotent setter for documentOptions using translate.instant
  private setDocumentOptions(): void {
    this.documentOptions.set([
      {
        value: AccountV2Models.DocumentType.P,
        content: this.translateService.instant(TranslationKeys.AccountProfile_DocumentsForm_PassportDocument),
      },
      {
        value: AccountV2Models.DocumentType.I,
        content: this.translateService.instant(TranslationKeys.AccountProfile_DocumentsForm_IDDocument),
      },
    ]);
    this.cdr.markForCheck();
  }

  private handleAuthenticated(): void {
    this.loadData();
  }

  private handleUnauthenticated(): void {
    // In SPA re-entry auth can transiently emit false before settling; still try session load.
    this.loadData();
  }

  private showGetSessionErrorModal(error: unknown): void {
    const modalConfiguration = this.config().sessionDialogModalsRepository.modalDialogExceptions.find((modal) => {
      return modal.modalDialogSettings.modalDialogId === SessionModals.SessionNotFound;
    });
    this.modalDialogService
      .openModal({
        title: modalConfiguration?.modalDialogContent.modalTitle || SessionModals.SessionNotFound + 'ModalTitle',
        introText:
          modalConfiguration?.modalDialogContent.modalDescription || SessionModals.SessionNotFound + 'ModalDescription',
        titleImageSrc:
          modalConfiguration?.modalDialogContent.modalImageSrc || SessionModals.SessionNotFound + 'ModalImageSrc',
        layoutConfig: {
          size: ModalDialogSize.SMALL,
        },
        footerButtonsConfig: {
          isVisible: true,
          actionButton: {
            label:
              modalConfiguration?.modalDialogButtonsControl.actionButtonLabel ||
              SessionModals.SessionNotFound + 'ModalActionButtonLabel',
            layout: {
              size: LayoutSize.MEDIUM,
              style: ButtonStyles.ACTION,
            },
          },
          secondaryButton: {
            label:
              modalConfiguration?.modalDialogButtonsControl.secondaryButtonLabel ||
              SessionModals.SessionNotFound + 'ModalSecondaryButtonLabel',
            link: {
              url:
                modalConfiguration?.modalDialogButtonsControl.secondaryButtonLink || SessionModals.SessionNotFound + '',
            },
            layout: {
              size: LayoutSize.MEDIUM,
              style: ButtonStyles.LINK,
            },
          },
        },
        programmaticOpen: true,
      } as ModalDialogConfig)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        complete: () => {
          globalThis.location.reload();
        },
      });
    this.trackAnalyticsError(this.getErrorResponse(error));
  }

  protected loadData(): void {
    const cookieValue = this.cookiesService.get(CookiesKeys.SELECTED_POINT_OF_SALE);
    const preferredCountryFromPointOfSale =
      cookieValue !== null && cookieValue !== undefined
        ? cookieValue.trim().toUpperCase()
        : (this.pointOfSaleService.getCurrentPointOfSale()?.code ?? 'CO').trim().toUpperCase();

    forkJoin({
      countries: this.countryMapperService.getCountiesUsingResourceClient(
        this.config().culture,
        preferredCountryFromPointOfSale
      ),
      account: this.accountClientV2.sessionGET('2'),
    }).subscribe({
      next: ({ countries, account }) => {
        this.normalizeAccountCountries(account);
        this.normalizeDates(account);

        this.handleLoadData(countries, account);
      },
      error: (error) => {
        this.onDataLoadComplete();
        this.logger.error('AccountProfileComponent', 'Error session settings', error);
        this.showGetSessionErrorModal(error);
      },
    });
  }

  protected handleLoadData(
    countries: {
      countriesOptions: RfListOption[];
      countryPrefixOptions: RfListOption[];
    },
    account: AccountV2Models.QueryResponse_1OfOfAccountDtoAndApplicationAnd_0AndCulture_neutralAndPublicKeyToken_null
  ): void {
    this.updateConfigsWithCountries(countries);

    if (account?.result?.data) {
      this.handleAccountSession(account.result.data);
    }
    this.onDataLoadComplete();
  }

  private updateConfigsWithCountries(countries: {
    countriesOptions: RfListOption[];
    countryPrefixOptions: RfListOption[];
  }): void {
    this.myProfileConfig.set({
      ...this.myProfileConfig(),
      countryOptions: countries.countriesOptions,
      countryPrefixOptions: countries.countryPrefixOptions,
    } as MyProfileConfig);

    this.travelDocumentsConfig.set({
      ...this.travelDocumentsConfig(),
      countryOptions: countries.countriesOptions,
    } as TravelDocumentsConfig);

    this.accountCompanionsConfig.set({
      ...this.accountCompanionsConfig(),
      countryOptions: countries.countriesOptions,
    } as AccountCompanionsConfig);

    this.countryOptions.set(countries.countriesOptions);
    this.countryPrefixOptions.set(countries.countryPrefixOptions);
  }

  protected refreshAccountSession(): void {
    this.globalLoaderService.show();
    this.accountClientV2.sessionGET('2').subscribe({
      next: (response) => {
        if (response.result?.data) {
          this.handleAccountSession(response.result.data);
        }
        this.globalLoaderService.hide(false);
      },
      error: (error) => {
        this.logger.error('AccountProfileComponent', 'Error refresh account session', error);
        this.showGetSessionErrorModal(error);
      },
    });
  }

  protected handleAccountSession(account: AccountV2Models.AccountDto): void {
    if (!account) {
      return;
    }

    this.previousCountry = account.addressCountry || '';
    const accountView =
      typeof structuredClone === 'function'
        ? structuredClone(account)
        : ({
            ...account,
            communicationChannels: [...(account.communicationChannels ?? [])],
            contacts: [...(account.contacts ?? [])],
            frequentTravelers: [...(account.frequentTravelers ?? [])],
            documents: [...(account.documents ?? [])],
          } as AccountV2Models.AccountDto);
    this.userData.set(accountView);

    this.normalizeDocumentExpirationDates(account.documents);
    this.categorizeAndSetDocuments(account.documents);
    this.companionsData.set([...(accountView.frequentTravelers ?? [])]);
    this.updateEmergencyContactStatus();
  }

  private normalizeDocumentExpirationDates(documents: AccountModels.PersonDocumentDto[] | null | undefined): void {
    if (!Array.isArray(documents)) {
      return;
    }

    for (const doc of documents) {
      if (typeof doc.expirationDate !== 'object') {
        doc.expirationDate = undefined;
        continue;
      }

      const date = new Date(doc.expirationDate);
      if (Number.isNaN(date.getTime()) || date.getFullYear() < 1000) {
        doc.expirationDate = undefined;
      }
    }
  }

  private categorizeAndSetDocuments(documents: AccountModels.PersonDocumentDto[] | null | undefined): void {
    if (!documents) {
      return;
    }

    const documentsAllowed: AccountModels.PersonDocumentDto[] = [];
    const documentsNotAllowed: AccountModels.PersonDocumentDto[] = [];

    for (const doc of documents) {
      if (doc.type === AccountModels.DocumentType.P || doc.type === AccountModels.DocumentType.I) {
        documentsAllowed.push(doc);
      } else {
        documentsNotAllowed.push(doc);
      }
    }

    this.documentsNotAllowed.set(documentsNotAllowed);
    this.documentsAllowed.set(documentsAllowed);
  }

  private updateEmergencyContactStatus(): void {
    this.hasEmergencyContact.set(
      !!this.userData()?.contacts?.find((c) => c.type?.toString() === AccountV2Models.ContactType.Emergency)
    );
  }

  protected onDataLoadComplete(): void {
    this.subscribeComposerNotifier();
    this.composer.updateComposerRegisterStatus(this.data().id, ComposerStatusEnum.LOADED);
    this.isLoading.set(false);
    requestAnimationFrame(() => {
      this.myProfileContainer()?.forceSyncDataToForms();
    });
    this.emitDynamicPageReady(this.baseConfig(), 'accaccountProfile_uiplus', DynamicPageReadyState.RENDERED);
  }

  protected updateAccountPersonalInfo(form: AccountPersonalInformation): void {
    const personalFormSummary = this.formSummaryStore.getSummary(this.formsNames.get('account-personal')!);
    personalFormSummary.showSaveLoadingState(true);
    const updateAccountRequest = {
      request: {
        account: {
          firstName: form.firstName,
          lastName: form.lastName,
          gender: form.gender,
          // Commented until city behaviour is decided
          //addressCity: form.city,
          addressLine: form.address,
          addressCountry: form.addressCountry,
          nationality: form.nationality,
          //dateOfBirth: `${form.birthday.year}-${form.birthday.month}-${form.birthday.day}T00:00:00`,
        },
      },
    } as AccountV2Models.UpdateCurrentAccountCommand;

    if (updateAccountRequest?.request?.account && this.previousCountry !== form.addressCountry) {
      updateAccountRequest.request.account.addressCity = '';
      updateAccountRequest.request.account.addressProvince = '';
    }

    this.accountClientV2.sessionPATCH('2', updateAccountRequest).subscribe({
      next: (res) => {
        if (res?.success) {
          this.previousCountry = form.addressCountry;
          this.formSummaryStore.changeView(this.formsNames.get('account-personal')!, FormSummaryViews.SUMMARY);
          personalFormSummary.focusAfterSave();
        }
        personalFormSummary.showSaveLoadingState(false);
      },
      error: (error) => {
        error = this.getLifeMilesCountryError(error, ErrorCodesAsyncValidators.PERSONAL_DATA);

        this.showErrorNotification(error);
        this.logger.error('AccountProfileComponent', 'Error updating account personal info', error);
        personalFormSummary.showSaveLoadingState(false);
      },
    });
  }

  private areChannelsEqualIgnoreOrder(
    a: AccountModels.PersonCommunicationChannelDto[] | null | undefined,
    b: AccountModels.PersonCommunicationChannelDto[] | null | undefined
  ): boolean {
    if (a === b) return true;
    if (!a || !b) return false;
    if (a.length !== b.length) return false;

    const key = (c: AccountModels.PersonCommunicationChannelDto): string => `${c.type}|${c.info}|${c.prefix ?? ''}`;

    const mapCount = (arr: AccountModels.PersonCommunicationChannelDto[]): Map<string, number> => {
      const m = new Map<string, number>();
      for (const c of arr) m.set(key(c), (m.get(key(c)) ?? 0) + 1);
      return m;
    };

    const ma = mapCount(a);
    const mb = mapCount(b);
    if (ma.size !== mb.size) return false;

    for (const [k, va] of ma) {
      if (mb.get(k) !== va) return false;
    }
    return true;
  }

  private getAdditionalDataPrefix(prefix: string): string {
    const i = prefix.lastIndexOf('-');
    if (i === -1) {
      const countryName: string | null = this.phoneCountryService.getCountryNameByPrefix(
        this.countryPrefixOptions(),
        prefix
      );
      if (countryName) {
        const countryCode: string | null = this.phoneCountryService.getCountryCodeByName(
          this.countryOptions(),
          countryName
        );
        return countryCode || '';
      }
      return '';
    }
    return prefix.slice(i + 1);
  }

  protected updateAccountContactInfo(form: SummaryContactData): void {
    const contactFormSummary = this.formSummaryStore.getSummary(this.formsNames.get('account-contact')!);
    contactFormSummary.showSaveLoadingState(true);
    const cleanedPrefix: string = form.prefix.replace(/-.*/, '');
    const additionalData: string = this.getAdditionalDataPrefix(form.prefix);
    const contactChannels = [] as AccountV2Models.PersonCommunicationChannelDto[];

    if (form.number || cleanedPrefix) {
      const phoneChannel = {
        type: AccountV2Models.ChannelType.Phone,
        prefix: cleanedPrefix,
        info: form.number,
        additionalData: additionalData,
      } as AccountV2Models.PersonCommunicationChannelDto;

      contactChannels.push(phoneChannel);
    }

    if (form.email) {
      const emailChannel = {
        type: AccountV2Models.ChannelType.Email,
        info: form.email,
      } as AccountV2Models.PersonCommunicationChannelDto;

      contactChannels.push(emailChannel);
    }

    if (this.areChannelsEqualIgnoreOrder(this.communicationChannel, contactChannels)) {
      setTimeout(() => {
        this.finishUpdateContactInfo();
        contactFormSummary.showSaveLoadingState(false);
      }, 1000);
    } else {
      const updateAccountCommand = {
        request: {
          account: {
            communicationChannels: contactChannels,
          },
        },
      } as AccountV2Models.UpdateCurrentAccountCommand;

      this.accountClientV2
        .sessionPATCH('2', updateAccountCommand)
        .pipe(
          catchError((error) => {
            this.logger.error('AccountProfileComponent', 'Error updating account contact info', error);
            this.showErrorNotification(error);
            contactFormSummary.showSaveLoadingState(false);
            return of(null);
          })
        )
        .subscribe((response) => {
          if (response?.success) {
            this.finishUpdateContactInfo();
            this.communicationChannel = contactChannels;
          }
          contactFormSummary.showSaveLoadingState(false);
        });
    }
  }

  private finishUpdateContactInfo(): void {
    // Invoke service directly because in this case the API call is not done by API error
    this.toastService.show(
      {
        status: ToastStatus.SUCCESS,
        message: 'AccountProfile.PersonalForm.Alert_Saved_Message',
      } as Toast,
      'accountMyProfileToast_Id'
    );
    this.logger.info('', 'Account contact info updated successfully');
    this.formSummaryStore.changeView(this.formsNames.get('account-contact')!, FormSummaryViews.SUMMARY);
    this.formSummaryStore.getSummary(this.formsNames.get('account-contact')!).focusAfterSave();
  }

  protected updateAccountDocumentsInfo(event: { form: AccountV2Models.PersonDocumentDto; index: number }): void {
    const documentsFormSummary = this.formSummaryStore.getSummary(
      this.formsNames.get('account-profile-documents')! + event.index
    );
    documentsFormSummary.showSaveLoadingState(true);

    const documentsToUpdate = this.documentsAllowed().map((documents, idx) => {
      const form = this.formStore.getFormGroup(this.formsNames.get('account-profile-documents')! + idx)?.getRawValue();
      return {
        type: form?.documentType || documents.type,
        number: form?.documentNumber || documents.number,
        issuedCountry: form?.documentNationality || documents.issuedCountry,
        expirationDate: form?.documentExpirationDate
          ? this.dateHelper.fromShortDateToISOString(form?.documentExpirationDate)
          : documents.expirationDate,
      } as AccountModels.PersonDocumentDto;
    });

    if (event.index === -1) {
      documentsToUpdate.push(event.form);
    }

    const travelDocuments = documentsToUpdate.concat(this.documentsNotAllowed());
    const updateAccountDocumentsCommand = {
      request: {
        travelDocuments,
        requestType: 'FrequentTraveler',
      },
    } as AccountV2Models.UpdateTravelDocumentCommand;

    this.accountClientV2
      .travelDocuments('2', updateAccountDocumentsCommand)
      .pipe(
        catchError((error) => {
          error = this.getLifeMilesCountryError(error, ErrorCodesAsyncValidators.DOCUMENTS);

          this.showErrorNotification(error);
          this.logger.error('Error updating account documents', error);
          documentsFormSummary.showSaveLoadingState(false);
          return of(null);
        })
      )
      .subscribe((response) => {
        if (response?.success) {
          this.logger.info('', 'Account documents updated successfully');
          for (const document of documentsToUpdate) {
            if (document.expirationDate) {
              document.expirationDate = this.dateHelper.parseNaiveUtc(
                document.expirationDate.toString()
              ) as unknown as Date;
            }
          }
          this.documentsAllowed.set(documentsToUpdate);
          this.formSummaryStore.changeView(
            this.formsNames.get('account-profile-documents')! + event.index,
            FormSummaryViews.SUMMARY
          );
          documentsFormSummary.focusAfterSave();
        }
        documentsFormSummary.showSaveLoadingState(false);
      });
  }

  protected updateEmergencyContact(form: EmergencyContactData): void {
    const emergencyContactFormSummary = this.formSummaryStore.getSummary(
      this.formsNames.get('profile-emergency-contact')!
    );
    emergencyContactFormSummary.showSaveLoadingState(true);
    const emergencyContactDto = this.buildEmergencyContactDto(form);

    if (this.hasEmergencyContact()) {
      const request = {
        request: {
          emergencyContact: emergencyContactDto,
        },
      } as AccountModels.UpdateAccountEmergencyContactCommand;
      this.accountClient
        .updateEmergencyContact('1', request)
        .pipe(
          catchError((error) => {
            this.logger.error('Error updating emergency contact', error);
            this.showErrorNotification(error);
            emergencyContactFormSummary.showSaveLoadingState(false);
            return of(null);
          })
        )
        .subscribe((response) => {
          if (response?.success) {
            this.logger.info('', 'Emergency contact updated successfully');
            this.formSummaryStore.changeView(
              this.formsNames.get('profile-emergency-contact')!,
              FormSummaryViews.SUMMARY
            );
            emergencyContactFormSummary.focusAfterSave();
          }
          emergencyContactFormSummary.showSaveLoadingState(false);
        });
    } else {
      const request = {
        request: {
          emergencyContact: emergencyContactDto,
        },
      } as AccountModels.AddAccountEmergencyContactCommand;
      this.accountClient
        .addEmergencyContact('1', request)
        .pipe(
          catchError((error) => {
            this.logger.error('Error adding emergency contact', error);
            this.showErrorNotification(error);
            emergencyContactFormSummary.showSaveLoadingState(false);
            return of(null);
          })
        )
        .subscribe((response) => {
          if (response?.success) {
            this.logger.info('', 'Emergency contact added successfully');
            this.formSummaryStore.changeView(
              this.formsNames.get('profile-emergency-contact')!,
              FormSummaryViews.SUMMARY
            );
            emergencyContactFormSummary.focusAfterSave();
            this.refreshAccountSession();
          }
          emergencyContactFormSummary.showSaveLoadingState(false);
        });
    }
  }

  protected updateAccountCompanionsInfo(event: { form: AccountModels.FrequentTravelerDto; index: number }): void {
    const companionsFormSummary = this.formSummaryStore.getSummary(
      this.formsNames.get('account-companions')! + event.index
    );
    companionsFormSummary.showSaveLoadingState(true);
    this.companionsData.update((companions) => {
      const updatedCompanions = [...companions];
      if (event.index === -1) {
        updatedCompanions.push(event.form);
      } else {
        event.form.companionId = updatedCompanions[event.index].companionId;
        updatedCompanions[event.index] = event.form;
      }
      return updatedCompanions;
    });

    const travelCompanionDto = this.buildCompanionDto(event.form);
    const isExistingCompanion = this.companionsData().some(
      (companion) => companion?.companionId && companion?.companionId === event.form?.companionId
    );

    if (isExistingCompanion) {
      const request = {
        request: {
          travelCompanion: travelCompanionDto,
        },
      } as AccountModels.UpdateAccountTravelCompanionCommand;
      this.accountClient
        .updateTravelCompanion('1', request)
        .pipe(
          catchError((error) => {
            this.choosePopupOrValidation(
              error,
              `${this.formsNames.get('account-companions')}${event.index}`,
              'country',
              ErrorCodesAsyncValidators.COMPANIONS
            );
            this.logger.error('Error updating travel companion', error);
            companionsFormSummary.showSaveLoadingState(false);
            return of(null);
          })
        )
        .subscribe((response) => {
          if (response?.success) {
            this.logger.info('', 'Travel companion updated successfully');
            this.formSummaryStore.changeView(
              this.formsNames.get('account-companions')! + event.index,
              FormSummaryViews.SUMMARY
            );
            companionsFormSummary.focusAfterSave();
          }
          companionsFormSummary.showSaveLoadingState(false);
        });
    } else {
      const request = {
        request: {
          travelCompanion: travelCompanionDto,
        },
      } as AccountModels.AddAccountTravelCompanionCommand;

      this.accountClient
        .addTravelCompanion('1', request)
        .pipe(
          catchError((error) => {
            this.logger.error('Error adding travel companion', error);
            this.showErrorNotification(error);
            companionsFormSummary.showSaveLoadingState(false);
            return of(null);
          })
        )
        .subscribe((response) => {
          if (response?.success) {
            this.logger.info('', 'Travel companion added successfully');
            this.formSummaryStore.changeView(
              this.formsNames.get('account-companions')! + event.index,
              FormSummaryViews.SUMMARY
            );
            this.formSummaryStore.getSummary(this.formsNames.get('account-companions')!).focusAfterSave();
            this.refreshAccountSession();
          }
          companionsFormSummary.showSaveLoadingState(false);
        });
    }
  }

  private initConfig(): Observable<AccountProfileConfig> {
    if (this.baseConfig()) {
      return this.http.get<AccountProfileConfig>(this.baseConfig()?.url || '').pipe(
        tap((config) => {
          this.assignConfig(config);
        })
      );
    } else {
      return this.configService
        .getBusinessModuleConfig<AccountProfileConfig>(this.data().config)
        .pipe(tap((config) => this.assignConfig(config)));
    }
  }

  private assignConfig(config: AccountProfileConfig): void {
    this.config.set(config);
    this.cultureServiceEx.setCulture(this.config().culture);
    this.setDocumentOptions();
    this.genderOptions = this.genderMapperService.getGenderOptions();
    this.setMyProfileConfig();
    this.setTravelDocumentsConfig();
    this.setAccountCompanionsConfig();
    this.logger.info('AccountProfileComponent', 'Business module config', this.config);
  }

  private setMyProfileConfig(): void {
    this.myProfileConfig.set({
      personalFormConfig: this.config().personalFormConfig,
      countryOptions: this.countryOptions(),
      countryPrefixOptions: this.countryPrefixOptions(),
      culture: this.config().culture,
      genderOptions: this.genderOptions,
      hideEditDocumentsSection: false, // Remove when API is ready
    });
  }

  private setTravelDocumentsConfig(): void {
    this.travelDocumentsConfig.set({
      culture: this.config().culture,
      documentOptions: this.documentOptions(),
      countryOptions: this.countryOptions(),
      documentsFormConfig: this.config().documentsFormConfig,
    });
  }

  private setAccountCompanionsConfig(): void {
    this.accountCompanionsConfig.set({
      culture: this.config().culture,
      companionsFormConfig: this.config().companionsFormConfig,
      countryOptions: this.countryOptions(),
      genderOptions: this.genderOptions,
      hideContainerAddButton: true, // Remove when API is ready
      hideEditButton: true,
    });
  }

  private subscribeComposerNotifier(): Subscription {
    return this.composer.notifier$
      .pipe(
        filter(
          (e: ComposerEvent) => e.type === ComposerEventTypeEnum.SubmitRequested && e.componentId === this.data().id
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((event: ComposerEvent) => {
        event.status = ComposerEventStatusEnum.SUCCESS;
        this.composer.notifyComposerEvent(event);
      });
  }

  private getBusinessConfig(): Observable<unknown> {
    return this.configService.getCommonConfig(CommonConfig.BUSINESS_CONFIG).pipe(
      tap((config) => {
        this.logger.info('AccountProfile', 'Business config', config);
      })
    );
  }

  private buildEmergencyContactDto(form: EmergencyContactData): AccountModels.AccountEmergencyContactDto {
    const email = this.userData()
      ?.contacts?.find((c) => c.type?.toString() === AccountModels.ContactType.Emergency)
      ?.channels?.find((channel) => channel.type?.toString() === AccountModels.ChannelType.Email)?.info;

    const phoneChannel = {
      type: AccountModels.ChannelType.Phone,
      prefix: form.prefix?.replace(/-.*/, ''),
      info: form.number,
    } as AccountModels.PersonCommunicationChannelDto;

    const channels = [phoneChannel];

    if (form.email || email) {
      const emailChannel = {
        type: AccountModels.ChannelType.Email,
        info: form.email || email!,
      } as AccountModels.PersonCommunicationChannelDto;
      channels.push(emailChannel);
    }

    const emergencyContact = {
      name: {
        first: form.firstName,
        last: form.lastName,
      },
      channels: channels,
    } as AccountModels.AccountEmergencyContactDto;

    return emergencyContact;
  }

  private buildCompanionDto(form: AccountModels.FrequentTravelerDto): AccountModels.FrequentTravelerDto {
    const name = {
      first: form.name?.first?.trim(),
      last: form.name?.last?.trim(),
    } as AccountModels.PersonNameDto;

    const address = {
      country: form.address?.country,
      city: form.address?.city,
    } as AccountModels.PersonAddressDto;

    const personInfo = {
      gender: form.personInfo?.gender,
      dateOfBirth: form.personInfo?.dateOfBirth,
    } as AccountModels.PersonInfoDto;

    const companionDto = {
      name,
      address,
      companionId: form.companionId,
      loyaltyId: form.loyaltyId,
      personInfo,
    } as AccountModels.FrequentTravelerDto;
    return companionDto;
  }

  private getErrorResponse(error: unknown): any {
    if (error && typeof error === 'object' && 'response' in error) {
      const response = (error as { response: unknown }).response;
      if (typeof response === 'string' && (response.startsWith('{') || response.startsWith('['))) {
        return JSON.parse(response);
      }
    }
    return error;
  }

  private showErrorNotification(error: unknown): void {
    const response = this.getErrorResponse(error);
    const modalConfiguration = this.config()?.accountProfileDialogModalsRepository?.modalDialogExceptions?.find(
      (modal) => modal.modalDialogSettings.modalDialogId === AccountProfileModals.PERSONAL_DATA_SAVE_ERROR
    );

    const dialogConfig = mapModalRepositoryConfigToModalDialogConfig(modalConfiguration);

    this.modalDialogService.openModal(dialogConfig).pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
    this.trackAnalyticsError(response);
  }

  private trackAnalyticsError(response: any): void {
    this.analyticsService.trackEvent({
      eventName: AnalyticsEventType.ERROR_POPUP,
      data: {
        event_category: this.baseItemsMapper.getEventCategory(document.location.pathname),
        page_location: document.location.href,
        page_referrer: document.referrer,
        page_title: document.title,
        language: this.cultureServiceEx.getUserCulture().locale,
        screen_resolution: globalThis.screen.width + 'x' + globalThis.screen.height,
        user_type: this.userData()?.customerNumber ? AnalyticsUserType.LOGGED_IN : AnalyticsUserType.GUEST,
        user_id: AnalyticsDataType.NA,
        page_name: AnalyticsPages.MEMBERS,
        error_pnr: AnalyticsDataType.NA,
        error_desc: response?.error?.description,
        error_id: response?.error?.code,
      },
    });
  }

  private normalizeCountry(value?: string | null): string {
    if (!value) return '';
    return this.countryMapperService.isCountryInLifemilesList(value) ? value : '';
  }

  public normalizeAccountCountries(account?: {
    result?: {
      data?: {
        addressCountry?: string | null;
        frequentTravelers?: Array<{ address?: { country?: string | null } }>;
        documents?: Array<{ issuedCountry?: string | null }>;
      };
    };
  }): void {
    const data = account?.result?.data;
    if (!data) return;
    data.addressCountry = this.normalizeCountry(data.addressCountry);
    if (Array.isArray(data.frequentTravelers)) {
      for (const traveler of data.frequentTravelers) {
        if (!traveler) continue;
        traveler.address = traveler.address ?? {};
        traveler.address.country = this.normalizeCountry(traveler.address.country);
      }
    }
    if (Array.isArray(data.documents)) {
      for (const doc of data.documents) {
        if (!doc) continue;
        doc.issuedCountry = this.normalizeCountry(doc.issuedCountry);
      }
    }
  }

  private normalizeDates(account?: {
    result?: {
      data?: {
        addressCountry?: string | null;
        frequentTravelers?: Array<{ address?: { country?: string | null } }>;
        documents?: Array<{
          issuedCountry?: string | null;
          expirationDate?: dayjs.Dayjs | Date | string | null;
          issuedDate?: dayjs.Dayjs | Date | string | null;
        }>;
      };
    };
  }): void {
    for (const doc of account?.result?.data?.documents ?? []) {
      if (doc.issuedDate && doc.issuedDate instanceof Date) {
        if (doc.issuedDate.getFullYear() < 10) {
          doc.issuedDate = new Date('0001-01-01T00:00:00.000Z');
        }
      }
    }
  }

  private choosePopupOrValidation(error: unknown, formName: string, fieldName: string, errorCode: string): void {
    const errorResponse = this.getErrorResponse(error);
    if (errorResponse?.error?.code === errorCode) {
      const form = this.formStore.getFormGroup(formName);
      form?.get(fieldName)?.setValue('');
      form?.get(fieldName)?.updateValueAndValidity();
    } else {
      this.showErrorNotification(error);
    }
  }

  private getLifeMilesCountryError(error: any, errorCode: string): any {
    const errorResponse = this.getErrorResponse(error);

    if (errorResponse?.error?.code === errorCode) {
      delete errorResponse.error.code;
      return { ...error, response: JSON.stringify(errorResponse) };
    }

    return error;
  }
}
