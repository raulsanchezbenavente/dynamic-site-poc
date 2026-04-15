import { HttpClient } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  effect,
  ElementRef,
  HostBinding,
  inject,
  input,
  OnDestroy,
  OnInit,
  Signal,
  signal,
} from '@angular/core';
import { AccountFacade } from '@dcx/module/api-clients';
import { MODULE_TRANSLATION_MAP, TranslationLoadStatusDirective } from '@dcx/module/translation';
import { AccountStateService, CustomerAccount, LoyaltyTranslationKeys, SessionModals } from '@dcx/ui/business-common';
import { AvatarSize, ModalDialogConfig, ModalDialogService, ModalDialogSize } from '@dcx/ui/design-system';
import {
  AlertType,
  AuthService,
  ButtonStyles,
  CommonConfig,
  ComposerEvent,
  ComposerEventStatusEnum,
  ComposerEventTypeEnum,
  ComposerService,
  ComposerStatusEnum,
  ConfigService,
  createResponsiveSignal,
  CultureServiceEx,
  DataModule,
  LayoutSize,
  LoggerService,
  NotificationService,
  ViewportSizeService,
} from '@dcx/ui/libs';
import { DynamicPageReadinessBase, DynamicPageReadyState } from '@dynamic-composite';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import dayjs from 'dayjs';
import {
  catchError,
  filter,
  finalize,
  forkJoin,
  Observable,
  of,
  Subject,
  Subscription,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs';

import { LoyaltyOverviewCardHeaderComponent } from './components/card-header/card-header.component';
import { LoyaltyOverviewCardInfoListComponent } from './components/info-list/info-list.component';
import { LoyaltyOverviewCardTranslationKeys } from './enums/loyalty-overview-card-translation-keys.enum';
import { LoyaltyOverviewCardConfig } from './models/loyalty-overview-card.config';
import { LoyaltyOverviewCard } from './models/loyalty-overview-card.model';
import { LoyaltyOverviewCardBuilderService } from './services/loyalty-overview-card-builder.service';

@Component({
  selector: 'loyalty-overview-card',
  templateUrl: './loyalty-overview-card.component.html',
  styleUrls: ['./styles/loyalty-overview-card.styles.scss'],
  imports: [
    TranslateModule,
    TranslationLoadStatusDirective,
    LoyaltyOverviewCardHeaderComponent,
    LoyaltyOverviewCardInfoListComponent,
  ],
  host: { class: 'loyalty-overview-card' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class LoyaltyOverviewCardComponent extends DynamicPageReadinessBase implements OnInit, OnDestroy {
  public isLoaded = signal<boolean>(false);
  public config = signal<LoyaltyOverviewCardConfig>({} as LoyaltyOverviewCardConfig);
  public tierMainColor = signal<string | null>(null);
  public tierDarkerColor = signal<string | null>(null);
  public loyaltyOverviewCardVM = signal<LoyaltyOverviewCard | null>(null);
  public tierAvatarSize = AvatarSize;
  private readonly cultureServiceEx = inject(CultureServiceEx);

  public isMobile!: Signal<boolean>;

  protected isReadyToDisplay = computed<boolean>(() => {
    return this.isLoaded();
  });
  private destroyMediaQueryListener: () => void = () => {};
  private readonly accountDto = signal<CustomerAccount | null>(null);
  private readonly destroy$ = new Subject<void>();

  private readonly elementRef = inject(ElementRef);
  private readonly configService = inject(ConfigService);
  private readonly composer = inject(ComposerService);
  private readonly logger = inject(LoggerService);
  private readonly viewportSizeService = inject(ViewportSizeService);
  private readonly authService = inject(AuthService);
  private readonly accountStateService = inject(AccountStateService);
  private readonly modalDialogService = inject(ModalDialogService);
  private readonly loyaltyOverviewCardBuilder = inject(LoyaltyOverviewCardBuilderService);

  private readonly data = signal<DataModule>(this.configService.getDataModuleId(this.elementRef));
  private readonly accountFacade = inject(AccountFacade);
  private readonly notificationService = inject(NotificationService);
  private readonly translateService = inject(TranslateService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly CMSKey = 'LoyaltyOverviewCard';
  protected readonly mappedKeys = MODULE_TRANSLATION_MAP[this.CMSKey];
  protected readonly translateKeys = LoyaltyOverviewCardTranslationKeys;
  public baseConfig = input<{ url: string } | null>(null);
  private readonly http = inject(HttpClient);

  private readonly updateTierAvatarConfigEffect = effect((onCleanup) => {
    const account = this.accountDto();
    if (account && this.isMobile) {
      const sub = this.loyaltyOverviewCardBuilder
        .getData({
          account,
          isMobile: this.isMobile(),
        })
        .subscribe((data) => {
          this.loyaltyOverviewCardVM.set(data);
          this.tierMainColor.set(data.mainColor ?? null);
          this.tierDarkerColor.set(data.darkerColor ?? null);
          this.cdr.markForCheck();
        });
      onCleanup(() => sub.unsubscribe());
    }
  });

  public ngOnInit(): void {
    this.setIsMobile();
    forkJoin([this.initConfig(), this.getBusinessConfig()])
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          const isAuthenticated$ = this.authService.isAuthenticatedKeycloak$().pipe(takeUntil(this.destroy$));
          isAuthenticated$.pipe(filter(Boolean), takeUntil(this.destroy$)).subscribe(() => this.handleAuthenticated());
          isAuthenticated$
            .pipe(
              filter((v) => !v),
              takeUntil(this.destroy$)
            )
            .subscribe(() => this.handleUnauthenticated());
        },
        error: (err) => {
          this.logger.error('Error loading data', err);
          this.onDataLoadComplete();
          this.showErrorNotification(err);
        },
      });
  }

  @HostBinding('style.--loyalty-overview-tier-gradient')
  public get tierBackgroundGradient(): string | null {
    const mainColor = this.tierMainColor();
    const darkerColor = this.tierDarkerColor();
    if (!mainColor || !darkerColor) {
      return null;
    }
    return `linear-gradient(0deg, ${mainColor} 0%, ${darkerColor} 100%)`;
  }

  private handleAuthenticated(): void {
    console.log('User authenticated, loading data...');
    this.loadData();
  }

  private handleUnauthenticated(): void {
    this.onDataLoadComplete();
  }

  public ngOnDestroy(): void {
    this.destroyMediaQueryListener();
    this.destroy$.next();
    this.destroy$.complete();
  }

  private onDataLoadComplete(): void {
    this.subscribeComposerNotifier();
    this.composer.updateComposerRegisterStatus(this.data().id, ComposerStatusEnum.LOADED);
    this.isLoaded.set(true);
  }

  private showGetSessionErrorModal(): void {
    const modalConfiguration = this.config().dialogModalsRepository.modalDialogExceptions.find((modal) => {
      return modal.modalDialogSettings.modalDialogId === SessionModals.SessionNotFound;
    });
    this.modalDialogService
      .openModal(
        {
          title: modalConfiguration?.modalDialogContent.modalTitle || SessionModals.SessionNotFound + 'ModalTitle',
          introText:
            modalConfiguration?.modalDialogContent.modalDescription ||
            SessionModals.SessionNotFound + 'ModalDescription',
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
                url: modalConfiguration?.modalDialogButtonsControl.secondaryButtonLink || '',
              },
              layout: {
                size: LayoutSize.MEDIUM,
                style: ButtonStyles.LINK,
              },
            },
          },
          programmaticOpen: true,
        } as ModalDialogConfig,
        undefined,
        undefined,
        false,
        30
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        complete: () => {
          globalThis.location.reload();
        },
      });
  }

  private loadData(): void {
    this.accountFacade
      .getSession()
      .pipe(
        tap((account) => {
          this.accountDto.set(account);
          this.accountStateService.setAccountData(account);
        }),
        switchMap((account) => {
          if (!account) {
            return of(null);
          }
          return this.loyaltyOverviewCardBuilder.getData({
            account,
            isMobile: this.isMobile(),
          });
        }),
        tap((data) => {
          if (data) {
            this.loyaltyOverviewCardVM.set(data);
            this.tierMainColor.set(data.mainColor ?? null);
            this.tierDarkerColor.set(data.darkerColor ?? null);
            this.cdr.markForCheck();
            this.emitDynamicPageReady(this.baseConfig(), 'loyaltyOverviewCard_uiplus', DynamicPageReadyState.RENDERED);
          }
        }),
        catchError((error) => {
          this.loyaltyOverviewCardVM.set(this.getDefaultLoyaltyData());
          this.showGetSessionErrorModal();
          this.logger.error('LoyaltyOverviewCardComponent', 'Error load data', error);
          return of(null);
        }),
        finalize(() => this.onDataLoadComplete()),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  /**
   * Initializes the configuration of the LoyaltyOverviewCard component.
   * This function is responsible for obtaining the configuration of the business module and making
   * @returns An Observable that is populated once configuration initialization has completed.
   */
  private initConfig(): Observable<LoyaltyOverviewCardConfig> {
    if (this.baseConfig()) {
      return this.http.get<LoyaltyOverviewCardConfig>(this.baseConfig()?.url || '').pipe(
        tap((response) => {
          this.config.set(response);
        })
      );
    } else {
      return this.configService.getBusinessModuleConfig<LoyaltyOverviewCardConfig>(this.data().config).pipe(
        tap((config) => {
          this.config.set(config);
          this.logger.info('LoyaltyOverviewCardComponent', 'Business module config', this.config());
        })
      );
    }
  }

  private getDefaultLoyaltyData(): LoyaltyOverviewCard {
    const formatPattern = this.cultureServiceEx.getUserCulture?.()?.longDateFormat ?? 'MMM d, YYYY';
    return {
      greeting: this.translateService.instant(LoyaltyOverviewCardTranslationKeys.OverviewCard_Greeting_Text, {
        name: '-',
      }),
      amount: '-',
      loyaltyId: '-',
      tierName: '-',
      userFullName: '-',
      expirationDateConfig: {
        date: dayjs.utc(),
        format: formatPattern,
      },
      tierAvatarConfig: {
        tierName: '-',
        size: AvatarSize.EXTRA_SMALL,
        icon: {
          name: 'lifemiles',
          ariaAttributes: {
            ariaLabel: `${this.translateService.instant(LoyaltyTranslationKeys.Lifemiles_Text)} + ${this.loyaltyOverviewCardVM()?.tierName}`,
          },
        },
      },
    };
  }

  private setIsMobile(): void {
    const breakpoint = this.viewportSizeService.getComponentLayoutBreakpoint(
      '--journey-overview-card-layout-breakpoint'
    );
    const mediaQuery = `(max-width: ${breakpoint}px)`;

    [this.isMobile, this.destroyMediaQueryListener] = createResponsiveSignal(mediaQuery);
  }

  /**
   * Subscribes to the `notifier$` Observable of the `composer` object.
   * This function filters the events based on the type and componentId,
   * and then updates the status of the event to SUCCESS before notifying the composer.
   * @returns An Observable that completes once the subscription is set up.
   */
  private subscribeComposerNotifier(): Subscription {
    return this.composer.notifier$
      .pipe(
        filter(
          (e: ComposerEvent) => e.type === ComposerEventTypeEnum.SubmitRequested && e.componentId === this.data().id
        )
      )
      .subscribe((event: ComposerEvent) => {
        event.status = ComposerEventStatusEnum.SUCCESS;
        this.composer.notifyComposerEvent(event);
      });
  }

  /**
   * Retrieves the business configuration.
   * This method fetches the common business configuration using the ConfigService and logs the configuration.
   * @returns An Observable that emits the business configuration once it is retrieved.
   */
  private getBusinessConfig(): Observable<unknown> {
    return this.configService.getCommonConfig(CommonConfig.BUSINESS_CONFIG).pipe(
      tap((config) => {
        this.logger.info(this.CMSKey, 'Business config', config);
      })
    );
  }

  private showErrorNotification(error: any): void {
    const response =
      error.response?.startsWith('{') || error.response?.startsWith('[') ? JSON.parse(error.response) : error;
    this.notificationService.showNotification({
      title: this.translateService.instant(LoyaltyOverviewCardTranslationKeys.OverviewCard_Error_Title),
      message: this.translateService.instant(
        response?.error?.code ?? LoyaltyOverviewCardTranslationKeys.OverviewCard_Exception
      ),
      alertType: AlertType.ERROR,
      buttonPrimaryText: this.translateService.instant('Common.OK'),
    });
  }
}
