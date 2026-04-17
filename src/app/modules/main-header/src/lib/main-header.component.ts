import { HttpClient } from '@angular/common/http';
import { Component, effect, ElementRef, inject, input, OnDestroy, OnInit, signal, Signal } from '@angular/core';
import { MODULE_TRANSLATION_MAP, TranslationLoadStatusDirective } from '@dcx/module/translation';
import {
    BANNER_BREAKPOINT_CONFIG,
    BANNER_DEFAULT_CONFIG,
    ComposerEvent,
    ComposerEventStatusEnum,
    ComposerEventTypeEnum,
    ComposerService,
    ComposerStatusEnum,
    ConfigService,
    createResponsiveSignal,
    DataModule,
    GenerateIdPipe,
    LoggerService,
    ViewportSizeService,
} from '@dcx/ui/libs';
import { DynamicPageReadinessBase, DynamicPageReadyState } from '@dynamic-composite';
import { TranslateModule } from '@ngx-translate/core';
import { BehaviorSubject, filter, Observable, Subscription, tap } from 'rxjs';

import { MainHeaderResponsiveLayout } from './components/enums/main-header-responsive-layout.enum';
import { MainHeaderLayoutToggleComponent } from './layouts/main-header-layout-toggle/main-header-layout-toggle.component';
import { MainHeaderLayoutComponent } from './layouts/main-header-layout/main-header-layout.component';
import { MainHeaderConfig } from './models/main-header-config.interface';

@Component({
  selector: 'main-header-wrapper',
  templateUrl: './main-header.component.html',
  styleUrls: ['./styles/main-header.styles.scss'],
  providers: [
    {
      provide: BANNER_BREAKPOINT_CONFIG,
      useValue: BANNER_DEFAULT_CONFIG,
    },
  ],
  host: {
    class: 'main-header',
  },
  imports: [
    TranslateModule,
    TranslationLoadStatusDirective,
    MainHeaderLayoutComponent,
    MainHeaderLayoutToggleComponent,
  ],
  standalone: true,
})
export class CorporateMainHeaderComponent extends DynamicPageReadinessBase implements OnDestroy, OnInit {
  public isResponsive: Signal<boolean> = signal(false);
  public isLoaded = signal(false);
  public baseConfig = input<{ url: string } | null>(null);

  public config: MainHeaderConfig = {} as MainHeaderConfig;
  public mainHeaderResponsiveLayout = MainHeaderResponsiveLayout;

  protected currencyConfig: any;
  protected resizeObservable$: Observable<Event> = new Observable(); // review
  protected resizeSubscription$: Subscription = new Subscription(); // review
  protected windowWidthSubscription$: Subscription = new Subscription();
  protected elementRef = inject(ElementRef);
  protected configService = inject(ConfigService);
  protected composer = inject(ComposerService);
  protected logger = inject(LoggerService);
  protected generateId = inject(GenerateIdPipe);

  private readonly viewportSizeService = inject(ViewportSizeService);
  private readonly http = inject(HttpClient);

  private readonly translationsLoadedSubject = new BehaviorSubject<boolean | null>(null);
  public readonly translationsLoaded$ = this.translationsLoadedSubject
    .asObservable()
    .pipe(filter((value) => value !== null));

  private readonly data: DataModule = this.configService.getDataModuleId(this.elementRef);
  private destroyMediaQueryListener: () => void = () => {};
  private hasLoggedBaseConfig = false;
  private hasInitializedInternalInit = false;

  private readonly CMSKey = 'CorporateMainHeader';
  protected readonly mappedKeys = MODULE_TRANSLATION_MAP[this.CMSKey];

  private readonly dynamicPageEffect = effect(() => {
    const baseConfig = this.baseConfig();
    if (!this.hasLoggedBaseConfig && baseConfig?.url?.trim()) {
      const url = baseConfig.url.trim();
      console.log('[CorporateMainHeaderComponent] baseConfig received:', baseConfig);
      this.hasLoggedBaseConfig = true;

      this.http.get<MainHeaderConfig>(url).subscribe({
        next: (response) => {
          this.config = this.resolveConfig(response);
          this.isLoaded.set(true);
          this.emitDynamicPageReady(
            this.baseConfig(),
            'CorporateMainHeaderBlock_uiplus',
            DynamicPageReadyState.RENDERED
          );
        },
        error: () => {
          this.emitDynamicPageReady(this.baseConfig(), 'CorporateMainHeaderBlock_uiplus', DynamicPageReadyState.ERROR);
        },
      });
    }
  });

  private readonly translationsLoadedLogEffect = effect(() => {
    const loaded = this.dynamicPageTranslationsLoaded();
    if (loaded && !this.hasInitializedInternalInit) {
      this.hasInitializedInternalInit = true;
      this.internalInit();
    }
  });

  public ngOnInit(): void {
    this.setIsResponsive();

    if (!this.baseConfig()) {
      this.internalInit();
    }
  }

  public ngOnDestroy(): void {
    this.destroyMediaQueryListener();
  }

  public translationsLoaded(): void {
    this.translationsLoadedSubject.next(true);
  }

  protected internalInit(): void {
    this.translationsLoaded$.subscribe({
      next: () => {
        this.initConfig().subscribe(() => {
          this.subscribeComposerNotifier();
          this.composer.updateComposerRegisterStatus(this.data.id, ComposerStatusEnum.LOADED);
          this.isLoaded.set(true);
        });
      },
    });
  }

  private setIsResponsive(): void {
    const breakpoint = this.viewportSizeService.getComponentLayoutBreakpoint('--main-header-layout-breakpoint');
    const mediaQuery = `(max-width: ${breakpoint}px)`;

    [this.isResponsive, this.destroyMediaQueryListener] = createResponsiveSignal(mediaQuery);
  }

  /**
   * Initializes the configuration of the MainHeader component.
   * This function is responsible for obtaining the configuration of the business module and making
   * @returns An Observable that is populated once configuration initialization has completed.
   */
  private initConfig(): Observable<MainHeaderConfig> {
    return this.configService.getBusinessModuleConfig<MainHeaderConfig>(this.data.config).pipe(
      tap((config) => {
        this.config = this.resolveConfig(config);
        this.logger.info('MainHeaderComponent', 'Business module config', this.config);
      })
    );
  }

  private resolveConfig(raw: MainHeaderConfig): MainHeaderConfig {
    return {
      ...raw,
      logoMobile: raw.logoMobile ?? raw.logo,
      mainMenuListMobile: raw.mainMenuListMobile ?? raw.mainMenuList,
      secondaryNavOptionsMobile: raw.secondaryNavOptionsMobile ?? raw.secondaryNavAvailableOptions,
      showAuthButtonMobile: raw.showAuthButtonMobile ?? raw.showAuthButton,
      enableFixedHeaderOnScrollMobile: raw.enableFixedHeaderOnScrollMobile ?? raw.enableFixedHeaderOnScroll,
    };
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
        filter((e: ComposerEvent) => e.type === ComposerEventTypeEnum.SubmitRequested && e.componentId === this.data.id)
      )
      .subscribe((event: ComposerEvent) => {
        event.status = ComposerEventStatusEnum.SUCCESS;
        this.composer.notifyComposerEvent(event);
      });
  }
}
