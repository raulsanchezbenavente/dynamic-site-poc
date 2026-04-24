import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, ElementRef, inject, input, OnInit, signal } from '@angular/core';
import {
  AuthService,
  CommonConfig,
  ComposerEvent,
  ComposerEventStatusEnum,
  ComposerEventTypeEnum,
  ComposerService,
  ComposerStatusEnum,
  ConfigService,
  DataModule,
  IbeEventRedirectType,
  LoggerService,
  RedirectionService,
} from '@dcx/ui/libs';
import { filter, forkJoin, Observable, Subject, Subscription, takeUntil, tap } from 'rxjs';

import { AuthorizationConfig } from './models/authorization.config';

@Component({
  selector: 'authorization',
  template: ``,
  host: { class: 'authorization' },
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthorizationComponent implements OnInit {
  public baseConfig = input<{ url: string } | null>(null);
  public config = signal<AuthorizationConfig | null>(null);

  private readonly destroy$ = new Subject<void>();

  private readonly elementRef = inject(ElementRef);
  private readonly configService = inject(ConfigService);
  private readonly composer = inject(ComposerService);
  private readonly logger = inject(LoggerService);
  private readonly authService = inject(AuthService);
  private readonly redirectService = inject(RedirectionService);
  private readonly data = signal<DataModule>(this.configService.getDataModuleId(this.elementRef));
  private readonly http = inject(HttpClient);

  public ngOnInit(): void {
    forkJoin([this.initConfig(), this.getBusinessConfig()]).subscribe(() => {
      const isAuthenticated$ = this.authService.isAuthenticatedKeycloak$().pipe(takeUntil(this.destroy$));
      isAuthenticated$.pipe(filter(Boolean)).subscribe(() => this.handleAuthenticated());
      isAuthenticated$.pipe(filter((v) => !v)).subscribe(() => this.handleUnauthenticated());
    });
  }

  private handleAuthenticated(): void {
    this.onDataLoadComplete();
  }

  private handleUnauthenticated(): void {
    const fallback = `/${this.config()?.culture ?? ''}`;
    this.redirectService.redirect(IbeEventRedirectType.internalRedirect, this.config()?.redirectUrl ?? fallback);
  }

  private onDataLoadComplete(): void {
    this.subscribeComposerNotifier();
    this.composer.updateComposerRegisterStatus(this.data().id, ComposerStatusEnum.LOADED);
  }

  /**
   * Initializes the configuration of the Authorization component.
   * This function is responsible for obtaining the configuration of the business module and making
   * @returns An Observable that is populated once configuration initialization has completed.
   */
  private initConfig(): Observable<AuthorizationConfig> {
    if (this.baseConfig()) {
      return this.http.get<AuthorizationConfig>(this.baseConfig()?.url || '').pipe(
        tap((response) => {
          this.config.set(response);
        })
      );
    } else {
      return this.configService.getBusinessModuleConfig<AuthorizationConfig>(this.data().config).pipe(
        tap((config) => {
          this.config.set(config);
          this.logger.info('AuthorizationComponent', 'Business module config', this.config);
        })
      );
    }
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
        this.logger.info('Authorization', 'Business config', config);
      })
    );
  }
}
