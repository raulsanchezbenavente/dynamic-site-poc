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
  WritableSignal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  ComposerEvent,
  ComposerEventStatusEnum,
  ComposerEventTypeEnum,
  ComposerService,
  ComposerStatusEnum,
  ConfigService,
  DataModule,
  LoggerService,
  ViewportSizeService,
} from '@dcx/ui/libs';
import { DynamicPageReadinessBase, DynamicPageReadyState } from '@dynamic-composite';
import { TranslateModule } from '@ngx-translate/core';
import { filter, Observable, tap } from 'rxjs';

import { FooterNavComponent } from './components/footer-nav/footer-nav.component';
import { FooterPartnersComponent } from './components/footer-partners/footer-partners.component';
import { FooterSocialMediaComponent } from './components/footer-socialmedia/footer-socialmedia.component';
import { FooterMainConfig } from './models/footer-main.config';

@Component({
  selector: 'footer-main',
  templateUrl: './footer-main.component.html',
  styleUrls: ['./styles/footer-main.styles.scss'],
  host: { class: 'footer-main' },
  imports: [TranslateModule, FooterNavComponent, FooterPartnersComponent, FooterSocialMediaComponent],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CorporateFooterMainComponent extends DynamicPageReadinessBase implements OnInit {
  public isLoaded: WritableSignal<boolean> = signal(false);
  public baseConfig = input<{ url: string } | null>(null);

  public config: WritableSignal<FooterMainConfig> = signal({} as FooterMainConfig);
  public isResponsive: WritableSignal<boolean> = signal(false);
  public selectedMenu: WritableSignal<string> = signal('footerNavMenuId-0');

  protected elementRef = inject(ElementRef);
  protected configService = inject(ConfigService);
  protected composer = inject(ComposerService);
  protected logger = inject(LoggerService);
  private readonly viewportSizeService = inject(ViewportSizeService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly http = inject(HttpClient);

  private readonly data = signal<DataModule>(this.configService.getDataModuleId(this.elementRef));
  private hasLoggedBaseConfig = false;
  private hasInitializedInternalInit = false;

  constructor() {
    super();
    effect(() => {
      const baseConfig = this.baseConfig();
      if (!this.hasLoggedBaseConfig && baseConfig?.url?.trim()) {
        const url = baseConfig.url.trim();
        console.log('[CorporateFooterMainComponent] baseConfig received:', baseConfig);
        this.hasLoggedBaseConfig = true;

        this.http.get<FooterMainConfig>(url).subscribe({
          next: (response) => {
            this.config.set(response);
            this.isLoaded.set(true);
            this.emitDynamicPageReady(
              this.baseConfig(),
              'CorporateFooterMainBlock_uiplus',
              DynamicPageReadyState.RENDERED
            );
          },
          error: (error) => {
            this.emitDynamicPageReady(
              this.baseConfig(),
              'CorporateFooterMainBlock_uiplus',
              DynamicPageReadyState.ERROR
            );
          },
        });
      }
    });
  }

  private readonly translationsLoadedLogEffect = effect(() => {
    const loaded = this.dynamicPageTranslationsLoaded();
    if (loaded && !this.hasInitializedInternalInit) {
      this.hasInitializedInternalInit = true;
      this.setIsResponsive();
    }
  });

  public ngOnInit(): void {
    if (!this.baseConfig()) {
      this.initConfig()
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => {
          this.composer.updateComposerRegisterStatus(this.data().id, ComposerStatusEnum.LOADED);
          this.isLoaded.set(true);
        });
      this.subscribeComposerNotifier();
      this.setIsResponsive();
    }
  }

  public toggleMenu(id: string): void {
    if (this.isResponsive()) {
      if (this.selectedMenu() === id) {
        this.selectedMenu.set('');
      } else {
        this.selectedMenu.set(id);
      }
    }
  }

  protected setIsResponsive(): void {
    const breakpoint = this.viewportSizeService.getComponentLayoutBreakpoint('--main-footer-layout-breakpoint');
    const mediaQuery = globalThis.matchMedia(`(max-width: ${breakpoint}px)`);

    this.isResponsive.set(mediaQuery.matches);

    const listener = (event: MediaQueryListEvent): void => {
      this.isResponsive.set(event.matches);
      if (!this.isResponsive()) {
        this.selectedMenu.set('');
      }
    };

    mediaQuery.addEventListener('change', listener);
    this.destroyRef.onDestroy(() => {
      mediaQuery.removeEventListener('change', listener);
    });
  }

  /**
   * Initializes the configuration of the FooterMain component.
   * This function is responsible for obtaining the configuration of the business module.
   * @returns An Observable that is populated once configuration initialization has completed.
   */
  private initConfig(): Observable<FooterMainConfig> {
    return this.configService.getBusinessModuleConfig<FooterMainConfig>(this.data().config).pipe(
      tap((configValue) => {
        const processConfig = {
          ...configValue,
        } as FooterMainConfig;
        this.config.set(processConfig);
        this.logger.info('FooterMainComponent', 'Business module config', this.config());
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
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((event: ComposerEvent) => {
        event.status = ComposerEventStatusEnum.SUCCESS;
        this.composer.notifyComposerEvent(event);
      });
  }
}
