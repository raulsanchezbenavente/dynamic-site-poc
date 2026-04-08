import { ChangeDetectionStrategy, Component, ElementRef, Inject, inject, OnInit, signal } from '@angular/core';
import {
  DsButtonComponent,
  IconComponent,
  PanelAppearance,
  PanelBaseConfig,
  PanelComponent,
  PanelContentDirective,
  PanelDescriptionDirective,
  PanelHeaderAsideDirective,
  PanelHeaderComponent,
  PanelIconDirective,
  PanelTitleDirective,
} from '@dcx/ui/design-system';
import {
  ButtonConfig,
  ButtonStyles,
  CommonConfig,
  ComposerEvent,
  ComposerEventStatusEnum,
  ComposerEventTypeEnum,
  ComposerService,
  ComposerStatusEnum,
  ConfigService,
  DataModule,
  DictionaryType,
  HorizontalAlign,
  LayoutSize,
  LoggerService,
} from '@dcx/ui/libs';
import { filter, forkJoin, Observable, Subscription, tap } from 'rxjs';

import { LoyaltyStatusBenefitsComponent } from './components/loyalty-status-benefits/loyalty-status-benefits.component';
import { LoyaltyStatusOverviewBuilderInterface } from './interfaces/loyalty-status-overview-builder.interface';
import { LoyaltyStatusOverviewVM } from './models/loyalty-status-overview-vm.model';
import { LoyaltyStatusOverviewConfig } from './models/loyalty-status-overview.config';
import { LoyaltyStatusVm } from './models/loyalty-status-vm.model';
import {
  LOYALTY_STATUS_OVERVIEW_BUILDER_PROVIDER,
  LOYALTY_STATUS_OVERVIEW_BUILDER_SERVICE,
} from './tokens/injection-tokens';

@Component({
  selector: 'loyalty-status-overview',
  templateUrl: './loyalty-status-overview.component.html',
  styleUrls: ['./styles/loyalty-status-overview.styles.scss'],
  providers: [LOYALTY_STATUS_OVERVIEW_BUILDER_PROVIDER],
  host: { class: 'loyalty-status-overview' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    LoyaltyStatusBenefitsComponent,
    DsButtonComponent,
    IconComponent,
    PanelComponent,
    PanelContentDirective,
    PanelDescriptionDirective,
    PanelHeaderAsideDirective,
    PanelHeaderComponent,
    PanelIconDirective,
    PanelTitleDirective,
  ],
})
export class LoyaltyStatusOverviewComponent implements OnInit {
  public isLoaded = signal<boolean>(false);
  public config = signal<LoyaltyStatusOverviewConfig>({} as LoyaltyStatusOverviewConfig);
  public mainPanelConfig!: PanelBaseConfig;
  public discoverPanelConfig!: PanelBaseConfig;
  public discoverButtonConfig!: ButtonConfig;
  public LoyaltyStatusOverviewVm = signal<LoyaltyStatusOverviewVM>({} as LoyaltyStatusOverviewVM);
  public currentTier = signal<LoyaltyStatusVm>({} as LoyaltyStatusVm);
  public nextTier = signal<LoyaltyStatusVm>({} as LoyaltyStatusVm);
  public translations = signal<DictionaryType>({});

  private readonly elementRef = inject(ElementRef);
  private readonly configService = inject(ConfigService);
  private readonly composer = inject(ComposerService);
  private readonly logger = inject(LoggerService);

  private readonly data = signal<DataModule>(this.configService.getDataModuleId(this.elementRef));

  constructor(
    @Inject(LOYALTY_STATUS_OVERVIEW_BUILDER_SERVICE)
    protected loyaltyStatusOverviewBuilderService: LoyaltyStatusOverviewBuilderInterface
  ) {}

  public ngOnInit(): void {
    forkJoin([this.initConfig(), this.getBusinessConfig()]).subscribe(() => {
      this.subscribeComposerNotifier();
      this.composer.updateComposerRegisterStatus(this.data().id, ComposerStatusEnum.LOADED);
      this.isLoaded.set(true);
    });
  }

  protected buildLoyaltyOverviewData(): void {
    this.LoyaltyStatusOverviewVm.set(this.loyaltyStatusOverviewBuilderService.getData());
  }

  protected setTiersData(): void {
    const loyaltyData = this.LoyaltyStatusOverviewVm();
    this.currentTier.set(loyaltyData.current);
    if (loyaltyData.next) {
      this.nextTier.set(loyaltyData.next);
    }
  }

  protected setMainPanelConfig(): void {
    this.mainPanelConfig = {
      appearance: PanelAppearance.SHADOW,
      layoutConfig: {
        headerHorizontalAlign: HorizontalAlign.CENTER,
      },
    };
  }

  protected setDiscoverPanelConfig(): void {
    this.discoverPanelConfig = {
      appearance: PanelAppearance.BGFILL,
      layoutConfig: {
        headerHorizontalAlign: HorizontalAlign.LEFT,
        contentHorizontalAlign: HorizontalAlign.LEFT,
      },
    };
  }

  protected setDiscoverButtonConfig(): void {
    this.discoverButtonConfig = {
      label: this.config().discover.buttonLabel,
      layout: {
        size: LayoutSize.MEDIUM,
        style: ButtonStyles.SECONDARY,
      },
    };
  }

  /**
   * Initializes the configuration of the LoyaltyStatusOverview component.
   * This function is responsible for obtaining the configuration of the business module and making
   * @returns An Observable that is populated once configuration initialization has completed.
   */
  private initConfig(): Observable<LoyaltyStatusOverviewConfig> {
    return this.configService.getBusinessModuleConfig<LoyaltyStatusOverviewConfig>(this.data().config).pipe(
      tap((config) => {
        this.config.set(config);
        this.translations.set(config.translations);
        this.setMainPanelConfig();
        this.setDiscoverPanelConfig();
        this.setDiscoverButtonConfig();
        this.buildLoyaltyOverviewData();
        this.setTiersData();
        this.logger.info('LoyaltyStatusOverviewComponent', 'Business module config', this.config);
      })
    );
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
        this.logger.info('LoyaltyStatusOverview', 'Business config', config);
      })
    );
  }
}
