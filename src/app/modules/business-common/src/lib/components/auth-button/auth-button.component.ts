import { NgClass } from '@angular/common';
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
    Input,
    OnDestroy,
    OnInit,
    signal,
    ViewChild,
} from '@angular/core';
import { AccountClient, AccountFacade } from '@dcx/module/api-clients';
import {
    AvatarConfig,
    AvatarSize,
    DropdownComponent,
    DsButtonComponent,
    ModalDialogConfig,
    ModalDialogService,
    ModalDialogSize,
    OffCanvasConfig,
    SkeletonComponent,
    TooltipTextComponent,
} from '@dcx/ui/design-system';
import {
    AuthService,
    ButtonConfig,
    ButtonStyles,
    DropdownLayoutType,
    DropdownVM,
    EnumAnimationSkeleton,
    EnumAppearenceSkeleton,
    KEYCLOAK_CONSTANTS,
    KeycloakConfiguration,
    LayoutSize,
    SkeletonConfig,
    StorageService,
    TextHelperService,
} from '@dcx/ui/libs';
import { TranslateService } from '@ngx-translate/core';
import { catchError, finalize, of, retry, Subject, takeUntil } from 'rxjs';

import { LoyaltyTranslationKeys } from '../../enums/loyalty/loyalty-translation-keys.enum';
import { CustomerAccount, CustomerBalance, SessionModals } from '../../models';
import { GlobalLoaderService } from '../../services/global-loader.service';
import { CustomerLoyaltyService } from '../../services/loyalty/customer-loyalty.service';
import { AuthenticatedAccountMenuComponent } from '../authenticated-account-menu/authenticated-account-menu.component';
import { LoyaltyPointsComponent } from '../loyalty-points/loyalty-points.component';
import { LoyaltyPoints } from '../loyalty-points/models/loyalty-points.model';
import { TierAvatarConfig } from '../tier-avatar/models/tier-avatar.config';
import { TierAvatarComponent } from '../tier-avatar/tier-avatar.component';

import { AuthButtonLayout } from './enums/auth-button-layout.enum';
import { AuthButtonData } from './models/auth-button-data.model';
import { AuthButtonConfig } from './models/auth-button.config';

@Component({
  selector: 'auth-button',
  templateUrl: './auth-button.component.html',
  styleUrls: ['./styles/auth-button.styles.scss'],
  host: {
    class: 'auth-button',
  },
  imports: [
    NgClass,
    AuthenticatedAccountMenuComponent,
    DropdownComponent,
    DsButtonComponent,
    LoyaltyPointsComponent,
    SkeletonComponent,
    TierAvatarComponent,
    TooltipTextComponent,
  ],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthButtonComponent implements OnInit, OnDestroy {
  @Input({ required: true }) public data!: AuthButtonData;
  @Input({ required: true }) public config!: AuthButtonConfig;

  public readonly layout = input<AuthButtonLayout>(AuthButtonLayout.DEFAULT);
  public readonly isCompactLayout = computed(() => this.layout() === AuthButtonLayout.COMPACT);
  public readonly isCondensedLayout = computed(() => this.layout() === AuthButtonLayout.CONDENSED);

  /**
   * Reactive effect: re-evaluates truncation when layout signals change
   * (compact / condensed) and the name element already exists.
   */
  private readonly layoutEffect = effect(() => {
    this.isCompactLayout();
    this.isCondensedLayout();
    if (this.nameElRef?.nativeElement) {
      queueMicrotask(() => this.evaluateTruncation());
    }
  });

  public avatarConfig!: AvatarConfig;
  public notLoggedButtonConfig!: ButtonConfig;
  public loggedDropdownVMConfig!: DropdownVM;
  public isLogged!: boolean;
  public menuOffCanvasConfig!: OffCanvasConfig;
  public isOpenMenu!: boolean;
  public tierName = '';
  public tierMainColor: string | null = null;
  public tierDarkerColor: string | null = null;
  public isLoaded = signal<boolean>(false);

  public loyaltyPointsModel!: LoyaltyPoints;

  public nameTooltipVisible = false;
  public nameTooltipPosition: { [key: string]: string } = {};

  public tierAvatarConfig!: TierAvatarConfig;
  public skeletonConfig: SkeletonConfig = {
    appearance: EnumAppearenceSkeleton.LINE,
    animation: EnumAnimationSkeleton.PULSE,
  };

  public nameInitials!: string;
  private keycloakConfig!: KeycloakConfiguration;
  private readonly destroy$ = new Subject<void>();
  private readonly translate = inject(TranslateService);
  private readonly authService = inject(AuthService);
  private readonly accountFacade = inject(AccountFacade);
  private readonly textHelperService = inject(TextHelperService);
  private readonly modalDialogService = inject(ModalDialogService);
  private readonly accountClient = inject(AccountClient);
  private readonly globalLoaderService = inject(GlobalLoaderService);
  private readonly customerLoyaltyService = inject(CustomerLoyaltyService);
  private readonly storageService = inject(StorageService);
  private readonly cdr = inject(ChangeDetectorRef);

  private isTriggerFocused = false;

  private nameElRef?: ElementRef<HTMLElement>;
  @ViewChild('nameTooltip') private readonly nameTooltip?: TooltipTextComponent;

  private nameResizeObserver?: ResizeObserver;
  public isNameTruncated = false;

  /**
   * ViewChild setter: runs when the deferred name element is inserted.
   * Sets up truncation monitoring and performs two-frame initial measurements.
   * If focus was already on the trigger and the name is truncated after measurement,
   * the tooltip is shown immediately.
   * @param ref Name element reference or undefined on destruction.
   */
  @ViewChild('nameEl')
  set nameElSetter(ref: ElementRef<HTMLElement> | undefined) {
    this.nameElRef = ref;
    if (ref) {
      this.startTruncationMonitoring();
      // Two-frame measurement to ensure all styles applied
      requestAnimationFrame(() => {
        this.evaluateTruncation();
        requestAnimationFrame(() => {
          this.evaluateTruncation();
          if (this.isTriggerFocused && this.isNameTruncated) {
            this.nameTooltip?.show();
          }
        });
      });
    }
  }

  @HostBinding('class.auth-button--condensed')
  public get isCondensedClass(): boolean {
    return this.isCondensedLayout();
  }

  @HostBinding('class.auth-button--compact')
  public get isCompactClass(): boolean {
    return this.isCompactLayout();
  }

  @HostBinding('style.--auth-button-tier-border-color')
  public get tierBorderColor(): string | null {
    return this.tierDarkerColor;
  }

  public ngOnInit(): void {
    this.internalInit();
  }

  public ngOnDestroy(): void {
    this.nameResizeObserver?.disconnect();
    this.destroy$.next();
    this.destroy$.complete();
  }

  public onClickToggleMenu(): void {
    this.isOpenMenu = !this.isOpenMenu;
  }

  public onClickLogin(): void {
    const path = this.buildRedirectUrl(this.data.redirectUrlAfterLogin?.url);
    this.authService.login(path);
  }

  public onLogout(url?: string): void {
    this.globalLoaderService.show();
    this.executeBackendLogout(() => {
      this.authService.logout(globalThis.location.origin + (url || this.data.redirectUrlAfterLogout?.url));
    });
  }

  protected executeBackendLogout(finalizeCallback: () => void): void {
    const logoutRetryAttempts = this.keycloakConfig?.logoutRetryAttempts ?? 0;
    this.accountClient
      .sessionDELETE()
      .pipe(
        retry(logoutRetryAttempts),
        catchError(() => of(null)),
        finalize(() => finalizeCallback())
      )
      .subscribe();
  }

  protected internalInit(): void {
    this.setButtonConfig();
    this.setLoggedDropdownVMConfig();
    this.setupEvents();
  }

  protected buildRedirectUrl(path?: string): string {
    const fallback = `/${this.config?.culture ?? ''}`;
    return `${globalThis.location.origin}${path || fallback}`;
  }

  protected setButtonConfig(): void {
    this.notLoggedButtonConfig = {
      icon: {
        name: 'user-circle',
      },
      label: 'Sign In',
      layout: {
        size: LayoutSize.SMALL,
        style: ButtonStyles.SECONDARY,
      },
    } as ButtonConfig;

    this.translate
      .stream('Auth.AuthButton.SignIn')
      .pipe(takeUntil(this.destroy$))
      .subscribe((translated) => {
        const nextLabel = typeof translated === 'string' ? translated.trim() : '';
        if (!nextLabel || nextLabel === 'Auth.AuthButton.SignIn') {
          return;
        }

        // Reassigning config + markForCheck ensures OnPush renders translation updates.
        this.notLoggedButtonConfig = {
          ...this.notLoggedButtonConfig,
          label: nextLabel,
        };
        this.cdr.markForCheck();
      });
  }

  protected setLoggedDropdownVMConfig(): void {
    this.loggedDropdownVMConfig = {
      config: {
        closeOnSelection: true,
        isDisabled: false,
        layoutConfig: {
          isAlwaysVisible: false,
          layout: DropdownLayoutType.PILLS,
        },
      },
      isVisible: false,
    } as DropdownVM;
  }

  /**
   * Starts observing size changes on the name element to re-evaluate truncation.
   * Ensures only one ResizeObserver instance is active.
   */
  private startTruncationMonitoring(): void {
    this.nameResizeObserver?.disconnect();
    requestAnimationFrame(() => this.evaluateTruncation());
    this.nameResizeObserver = new ResizeObserver(() => this.evaluateTruncation());
    this.nameResizeObserver.observe(this.nameElRef!.nativeElement);
  }

  /**
   * Evaluates whether the name text is truncated by comparing scrollWidth and client/offset width.
   * Adds a 1px tolerance for font/render rounding.
   */
  private evaluateTruncation(): void {
    const el = this.nameElRef?.nativeElement;
    if (!el) return;

    const width = el.clientWidth || el.offsetWidth;
    const truncated = el.scrollWidth > width + 1;
    this.isNameTruncated = truncated;
  }

  /**
   * Trigger focus handler (keyboard): sets focused flag, re-measures truncation,
   * and shows or hides the tooltip accordingly.
   */
  public onTriggerFocus(): void {
    this.isTriggerFocused = true;
    this.evaluateTruncation();
    if (this.isNameTruncated) {
      this.nameTooltip?.show();
    } else {
      this.nameTooltip?.hide();
    }
  }

  /**
   * Trigger blur handler: clears focused flag and hides the tooltip.
   */
  public onTriggerBlur(): void {
    this.isTriggerFocused = false;
    this.nameTooltip?.hide();
  }

  /**
   * Mouse enter on the name span: re-measures truncation and shows tooltip if truncated.
   */
  public onNameMouseEnter(): void {
    this.evaluateTruncation();
    if (this.isNameTruncated) {
      this.nameTooltip?.show();
    }
  }

  /**
   * Mouse leave on the name span: hides tooltip only when the trigger is not focused
   * (to preserve tooltip during keyboard focus).
   */
  public onNameMouseLeave(): void {
    if (!this.isTriggerFocused) {
      this.nameTooltip?.hide();
    }
  }

  /**
   * Normalizes displayed name: capitalize words, keep only the first word, trim extra spaces.
   */
  private formatName(raw: string): string {
    const normalized = this.textHelperService.getCapitalizeWords(raw || '').trim();
    return normalized.split(/\s+/)[0] || '';
  }

  /**
   * Sets initials for the user name and queues a truncation evaluation if the element is present.
   * @param customerAccount Account DTO containing user identification fields.
   */
  protected setNameInitials(customerAccount: CustomerAccount): void {
    this.nameInitials = this.formatName(customerAccount?.username || customerAccount?.firstName || '');
    if (this.nameElRef?.nativeElement) {
      queueMicrotask(() => this.evaluateTruncation());
    }
  }

  private setLoyaltyPointsModel(balance: CustomerBalance): void {
    const format = this.customerLoyaltyService.formatLoyaltyBalance(balance);
    this.loyaltyPointsModel = {
      amount: format,
      label: this.translate.instant(LoyaltyTranslationKeys.Lifemiles_Miles_Label),
    };
  }

  private setTierAvatarConfig(customerAccount: CustomerAccount): void {
    this.customerLoyaltyService
      .getCustomerProgramData(customerAccount)
      .pipe(takeUntil(this.destroy$))
      .subscribe((programData) => {
        this.tierName = programData.tierName;
        this.tierMainColor = programData.mainColor;
        this.tierDarkerColor = programData.darkerColor;
        this.cdr.markForCheck();
        this.tierAvatarConfig = {
          tierName: programData.tierName,
          mainColor: programData.mainColor,
          darkerColor: programData.darkerColor,
          size: this.isCompactLayout() ? AvatarSize.EXTRA_SMALL : AvatarSize.SMALL,
          icon: {
            name: 'lifemiles',
            ariaAttributes: {
              ariaLabel: '',
            },
          },
        };
        this.updateTierIconLabel();
      });
  }

  private updateTierIconLabel(): void {
    if (this.tierAvatarConfig) {
      this.tierAvatarConfig = {
        ...this.tierAvatarConfig,
        icon: {
          ...this.tierAvatarConfig.icon,
          ariaAttributes: {
            ariaLabel: this.translate.instant(LoyaltyTranslationKeys.Lifemiles_Text),
          },
        },
      };
    }
  }

  private setupEvents(): void {
    this.subscribeToIsAuthenticatedKeycloak();
    this.subscribeToKeycloakConfig();
    this.subscribeToExpiredSession();
    this.subscribeToForceLogout();
  }

  private subscribeToIsAuthenticatedKeycloak(): void {
    this.authService
      .isAuthenticatedKeycloak$()
      .pipe(takeUntil(this.destroy$))
      .subscribe((isAuthenticated) => {
        if (isAuthenticated === undefined) {
          return;
        }

        if (isAuthenticated) {
          this.handleAuthenticatedUser();
        } else {
          this.handleUnauthenticatedUser();
        }
      });
  }

  private subscribeToKeycloakConfig(): void {
    this.authService
      .keycloakConfig$()
      .pipe(takeUntil(this.destroy$))
      .subscribe((response) => {
        if (response) {
          this.keycloakConfig = response;
        }
      });
  }

  private logoutIfSessionExpiredOnReload(): void {
    const retry = localStorage.getItem(KEYCLOAK_CONSTANTS.RETRY_LOGOUT);
    if (retry === KEYCLOAK_CONSTANTS.STORAGE_FLAG_VALUE) {
      this.onLogout();
    }
  }

  private subscribeToExpiredSession(): void {
    this.authService
      .expiredSession$()
      .pipe(takeUntil(this.destroy$))
      .subscribe((response) => {
        if (response) {
          localStorage.setItem(KEYCLOAK_CONSTANTS.NEEDS_IDP_LOGOUT, KEYCLOAK_CONSTANTS.STORAGE_FLAG_VALUE);
          this.showExpiredSessionModal();
        }
      });
  }

  private subscribeToForceLogout(): void {
    this.authService
      .forceLogout$()
      .pipe(takeUntil(this.destroy$))
      .subscribe((response) => {
        if (response) {
          this.onLogout(globalThis.location.pathname);
        }
      });
  }

  private showExpiredSessionModal(): void {
    const modalConfiguration = this.data?.dialogModalsRepository?.modalDialogExceptions?.find((modal) => {
      return modal.modalDialogSettings.modalDialogId === SessionModals.SessionExpired;
    });
    this.modalDialogService
      .openModal({
        title: modalConfiguration?.modalDialogContent.modalTitle || SessionModals.SessionExpired + 'ModalTitle',
        introText:
          modalConfiguration?.modalDialogContent.modalDescription || SessionModals.SessionExpired + 'ModalDescription',
        titleImageSrc:
          modalConfiguration?.modalDialogContent.modalImageSrc || '/assets/ui_plus/imgs/popup/auth-session-expired.svg',
        layoutConfig: {
          size: ModalDialogSize.SMALL,
        },
        footerButtonsConfig: {
          isVisible: true,
          actionButton: {
            label:
              modalConfiguration?.modalDialogButtonsControl.actionButtonLabel ||
              SessionModals.SessionExpired + 'ModalActionButtonTitle',
            layout: {
              size: LayoutSize.MEDIUM,
              style: ButtonStyles.ACTION,
            },
          },
        },
        programmaticOpen: true,
      } as ModalDialogConfig)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {},
        complete: () => {
          this.onLogout();
        },
      });
  }

  private handleAuthenticatedUser(): void {
    this.logoutIfSessionExpiredOnReload();
    this.accountFacade
      .getSession()
      .pipe(
        catchError(() => {
          this.isLoaded.set(true);
          return of(null);
        })
      )
      .subscribe((res) => {
        if (res) {
          this.setAuthenticationData(res);
        }
      });
  }

  private handleUnauthenticatedUser(): void {
    this.authService.removeAuthenticationTokenData();
    this.isLogged = false;
    this.isLoaded.set(true);
  }

  /**
   * Populates authenticated state (name, tier, loyalty points) and triggers initial truncation setup.
   * @param customerAccount Account session data.
   */
  private setAuthenticationData(customerAccount: CustomerAccount): void {
    this.isLoaded.set(true);
    this.setNameInitials(customerAccount);
    this.setTierAvatarConfig(customerAccount);
    this.setLoyaltyPointsModel(customerAccount.balance);
    this.isLogged = true;
  }
}
