import { HttpClient } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  input,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IconComponent } from '@dcx/ui/design-system';
import {
  CommonConfig,
  CommonTranslationKeys,
  ComposerEvent,
  ComposerEventStatusEnum,
  ComposerEventTypeEnum,
  ComposerService,
  ComposerStatusEnum,
  ConfigService,
  DataModule,
  IconConfig,
  LoggerService,
} from '@dcx/ui/libs';
import { DynamicPageReadinessBase, DynamicPageReadyState } from '@dynamic-composite';
import { TranslateModule } from '@ngx-translate/core';
import { filter, forkJoin, Observable, tap } from 'rxjs';

import { BreadcrumbConfig } from './models/breadcrumb.config';

@Component({
  selector: 'breadcrumb',
  templateUrl: './breadcrumb.component.html',
  styleUrls: ['./styles/breadcrumb.styles.scss'],
  host: { class: 'breadcrumb' },
  imports: [TranslateModule, IconComponent],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BreadcrumbComponent extends DynamicPageReadinessBase implements OnInit {
  public config = signal<BreadcrumbConfig>({} as BreadcrumbConfig);
  public isLoaded = signal<boolean>(false);
  public homeIconConfig!: IconConfig;
  public baseConfig = input<{ url: string } | null>(null);

  protected composer = inject(ComposerService);
  protected configService = inject(ConfigService);
  protected elementRef = inject(ElementRef);
  protected logger = inject(LoggerService);

  protected readonly translationKeys = CommonTranslationKeys;

  private readonly destroyRef = inject(DestroyRef);
  private readonly http = inject(HttpClient);
  private readonly data = signal<DataModule>(this.configService.getDataModuleId(this.elementRef));
  private hasLoggedBaseConfig = false;

  constructor() {
    super();
    effect(() => {
      const baseConfig = this.baseConfig();
      if (!this.hasLoggedBaseConfig && baseConfig?.url?.trim()) {
        const url = baseConfig.url.trim();
        this.hasLoggedBaseConfig = true;
        this.http.get<BreadcrumbConfig>(url).subscribe({
          next: (response) => {
            this.config.set(response);
            this.setHomeIconConfig();
            this.isLoaded.set(true);
            this.emitDynamicPageReady(this.baseConfig(), 'BreadcrumbBlock_uiplus', DynamicPageReadyState.RENDERED);
          },
          error: () => {
            this.emitDynamicPageReady(this.baseConfig(), 'BreadcrumbBlock_uiplus', DynamicPageReadyState.ERROR);
          },
        });
      }
    });
  }

  public ngOnInit(): void {
    if (!this.baseConfig()) {
      this.internalInit();
    }
  }

  protected internalInit(): void {
    forkJoin([this.initConfig(), this.getBusinessConfig()]).subscribe(() => {
      this.subscribeComposerNotifier();
      this.composer.updateComposerRegisterStatus(this.data().id, ComposerStatusEnum.LOADED);
      this.isLoaded.set(true);
    });
  }

  /**
   * Initializes the configuration of the BreadCrumb component.
   * This function is responsible for obtaining the configuration of the business module.
   * @returns An Observable that is populated once configuration initialization has completed.
   */
  private initConfig(): Observable<BreadcrumbConfig> {
    return this.configService.getBusinessModuleConfig<BreadcrumbConfig>(this.data().config).pipe(
      tap((configValue) => {
        this.config.set(configValue);
        this.setHomeIconConfig();
        this.logger.info('BreadCrumb', 'Business module config', this.config());
      })
    );
  }

  /**
   * Subscribes to the `notifier$` Observable of the `composer` object.
   * This function filters the events based on the type and componentId,
   * and then updates the status of the event to SUCCESS before notifying the composer.
   */
  private subscribeComposerNotifier(): void {
    this.composer.notifier$
      .pipe(
        filter(
          (e: ComposerEvent) => e.type === ComposerEventTypeEnum.SubmitRequested && e.componentId === this.data().id
        ),
        takeUntilDestroyed(this.destroyRef) // Automatically unsubscribes when the component is destroyed
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
      tap((configValue) => {
        this.logger.info('BreadCrumb', 'Business config', configValue);
      })
    );
  }

  private setHomeIconConfig(): void {
    this.homeIconConfig = {
      name: 'home',
      ariaAttributes: {
        ariaLabel: this.config().home?.title,
      },
    };
  }
}
