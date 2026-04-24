import { ChangeDetectionStrategy, Component, ElementRef, Inject, inject, OnInit, signal } from '@angular/core';
import {
  PanelAppearance,
  PanelBaseConfig,
  PanelComponent,
  PanelContentDirective,
  PanelHeaderComponent,
  PanelTitleDirective,
} from '@dcx/ui/design-system';
import {
  CommonConfig,
  ComposerEvent,
  ComposerEventStatusEnum,
  ComposerEventTypeEnum,
  ComposerService,
  ComposerStatusEnum,
  ConfigService,
  DataModule,
  LoggerService,
} from '@dcx/ui/libs';
import { TranslateService } from '@ngx-translate/core';
import { filter, forkJoin, Observable, Subscription, tap } from 'rxjs';

import { LoyaltyProgressCardComponent } from './components/loyalty-progress-card/loyalty-progress-card.component';
import { LoyaltyProgressBuilderInterface } from './interfaces/loyalty-progress-builder.interface';
import { LoyaltyProgressCardVM } from './models/loyalty-progress-card-vm.model';
import { LoyaltyProgressConfig } from './models/loyalty-progress.config';
import { LOYALTY_PROGRESS_BUILDER_PROVIDER, LOYALTY_PROGRESS_BUILDER_SERVICE } from './tokens/injection-tokens';

@Component({
  selector: 'loyalty-progress',
  templateUrl: './loyalty-progress.component.html',
  styleUrls: ['./styles/loyalty-progress.styles.scss'],
  host: { class: 'loyalty-progress' },
  imports: [
    LoyaltyProgressCardComponent,
    PanelComponent,
    PanelContentDirective,
    PanelHeaderComponent,
    PanelTitleDirective,
  ],
  providers: [LOYALTY_PROGRESS_BUILDER_PROVIDER],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoyaltyProgressComponent implements OnInit {
  public readonly panelAppearance = PanelAppearance.SHADOW;
  public isLoaded = signal<boolean>(false);
  public config = signal<LoyaltyProgressConfig | null>(null);
  public panelConfig = signal<PanelBaseConfig>({});
  public programs = signal<LoyaltyProgressCardVM[]>([]);

  private readonly elementRef = inject(ElementRef);
  private readonly configService = inject(ConfigService);
  private readonly composer = inject(ComposerService);
  private readonly logger = inject(LoggerService);

  private readonly data = signal<DataModule>(this.configService.getDataModuleId(this.elementRef));

  protected readonly translate = inject(TranslateService);

  constructor(
    @Inject(LOYALTY_PROGRESS_BUILDER_SERVICE)
    protected loyaltyProgressBuilderService: LoyaltyProgressBuilderInterface
  ) {}

  public ngOnInit(): void {
    forkJoin([this.initConfig(), this.getBusinessConfig()]).subscribe(() => {
      this.setPanelConfig();
      this.programs.set(this.loyaltyProgressBuilderService.getData());
      this.subscribeComposerNotifier();
      this.composer.updateComposerRegisterStatus(this.data().id, ComposerStatusEnum.LOADED);
      this.isLoaded.set(true);
    });
  }

  private setPanelConfig(): void {
    this.panelConfig.set({
      appearance: this.panelAppearance,
      title: this.translate.instant('Loyalty.Progress.Title'),
    });
  }

  /**
   * Initializes the configuration of the LoyaltyProgress component.
   * This function is responsible for obtaining the configuration of the business module and making
   * @returns An Observable that is populated once configuration initialization has completed.
   */
  private initConfig(): Observable<LoyaltyProgressConfig> {
    return this.configService.getBusinessModuleConfig<LoyaltyProgressConfig>(this.data().config).pipe(
      tap((config) => {
        this.config.set(config);
        this.logger.info('LoyaltyProgressComponent', 'Business module config', this.config());
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
        this.logger.info('LoyaltyProgress', 'Business config', config);
      })
    );
  }
}
