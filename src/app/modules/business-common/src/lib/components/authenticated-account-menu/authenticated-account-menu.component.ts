import { ChangeDetectorRef, Component, DestroyRef, inject, input, OnInit, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { OptionsListComponent, TabsService } from '@dcx/ui/design-system';
import { AccountInfo, OptionsList, OptionsListConfig, TextHelperService } from '@dcx/ui/libs';
import { TranslateService } from '@ngx-translate/core';

import { SkeletonAuthenticatedAccountMenuComponent } from './components/skeleton/skeleton-authenticated-account-menu.component';
import { MenuType } from './enums/menu-type.enum';
import { AuthAccountMenuOptionsConfig } from './models/auth-account-menu-options.config';

@Component({
  selector: 'authenticated-account-menu',
  templateUrl: './authenticated-account-menu.component.html',
  styleUrls: ['./styles/authenticated-account-menu.styles.scss'],
  host: { class: 'authenticated-account-menu' },
  imports: [OptionsListComponent, SkeletonAuthenticatedAccountMenuComponent],
  standalone: true,
})
export class AuthenticatedAccountMenuComponent implements OnInit {
  private static readonly LOGOUT_TRANSLATION_KEY = 'Auth.AuthenticatedAccountMenu.Logout';
  private static readonly ARIA_TRANSLATION_KEY = 'Auth.AuthenticatedAccountMenu.AriaLabel';

  public readonly config = input.required<AuthAccountMenuOptionsConfig>();

  public readonly logoutRequested = output<void>();

  public optionsConfig = signal<OptionsListConfig | null>(null);
  public isLoading = signal<boolean>(false);
  protected authenticatedUser = signal<AccountInfo | null>(null);

  private readonly textHelper = inject(TextHelperService);

  // providers
  private readonly translate = inject(TranslateService);

  // destroy ref for reactive translations
  private readonly destroyRef = inject(DestroyRef);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly tabsService = inject(TabsService);

  public ngOnInit(): void {
    this.internalInit();
  }

  public onOptionSelected(option: OptionsList): void {
    if (option.code === MenuType.LOGOUT) {
      this.logoutRequested.emit();
    }
  }

  /**
   * Determines if a menu option should be marked as active based on the current URL
   * @param menuOptionPath - The URL path for the menu option
   * @param menuType - The type of menu (MENU, LOGOUT, etc.)
   * @returns true if the menu option matches the current active route
   */
  private isActiveMenuOption(menuOptionPath: string, menuType: MenuType): boolean {
    if (menuType.toLowerCase() === MenuType.LOGOUT.toLowerCase()) {
      return false;
    }

    // Parse current URL and menu option URL
    const currentUrl = new URL(this.getLocationInfo().href);
    const menuUrl = new URL(menuOptionPath, this.getLocationInfo().origin);

    // Check if paths match (exact match or current path starts with menu path)
    if (!this.doPathsMatch(currentUrl.pathname, menuUrl.pathname)) {
      return false;
    }

    // If menu option has query parameters, they must all match exactly
    return this.doQueryParametersMatch(currentUrl.searchParams, menuUrl.searchParams);
  }

  /**
   * Returns the current location info
   * @returns The current location info
   */
  private getLocationInfo(): { href: string; origin: string } {
    return {
      href: globalThis.location.href,
      origin: globalThis.location.origin,
    };
  }

  /**
   * Compares two URL paths to determine if they match
   * @param currentPath - The current URL pathname
   * @param targetPath - The target menu option pathname
   * @returns true if paths match (exact or hierarchical match)
   */
  private doPathsMatch(currentPath: string, targetPath: string): boolean {
    const normalize = (path: string): string => path.replaceAll(/(^\/+|\/+)/g, '').toLowerCase();

    const normalizedCurrent = normalize(currentPath);
    const normalizedTarget = normalize(targetPath);

    // Exact match or hierarchical match (current path starts with target path)
    return (
      normalizedCurrent === normalizedTarget ||
      (normalizedTarget !== '' && normalizedCurrent.startsWith(`${normalizedTarget}/`))
    );
  }

  /**
   * Compares query parameters between current URL and menu option URL
   * @param currentParams - Current URL search parameters
   * @param menuParams - Menu option URL search parameters
   * @returns true if all menu parameters match current parameters
   */
  private doQueryParametersMatch(currentParams: URLSearchParams, menuParams: URLSearchParams): boolean {
    const menuParamsString = menuParams.toString();

    // If menu option has no query parameters, path match is sufficient
    if (!menuParamsString) {
      return true;
    }

    // Extract parameter keys from menu option
    const menuKeys = this.extractParameterKeys(menuParamsString);

    // Check if all menu parameters exist and match in current URL
    return menuKeys.every((key) => {
      const menuValue = menuParams.get(key);
      const currentValue = currentParams.get(key);
      return currentValue !== null && currentValue === menuValue;
    });
  }

  /**
   * Extracts parameter keys from a query string
   * @param queryString - The query string to parse
   * @returns Array of parameter keys
   */
  private extractParameterKeys(queryString: string): string[] {
    return queryString
      .split('&')
      .map((param) => param.split('=')[0])
      .filter((key) => key.length > 0);
  }

  private internalInit(): void {
    this.isLoading.set(false);
    this.setOptionsConfig();
    this.setupReactiveTranslations();
    // Subscribe to tab changes (default group unless specified differently)
    this.tabsService
      .selectedTab$()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((tab) => {
        if (tab) {
          this.updateSelectedOptionByTabId(tab.id!);
        }
      });
  }

  /**
   * Updates the selected option based on the provided tab ID
   * @param tabId - The ID of the selected tab
   */
  private updateSelectedOptionByTabId(tabId: string): void {
    const tabIndex = this.config().options.findIndex((opt) => opt.tabId === tabId);

    if (tabIndex === -1) {
      return;
    }

    const optionsConfigValue = this.optionsConfig();
    if (!optionsConfigValue) {
      return;
    }

    const currentSelectedIndex = optionsConfigValue.options.findIndex((option) => option.isSelected);
    if (currentSelectedIndex === tabIndex) {
      return;
    }

    for (const [index, option] of optionsConfigValue.options.entries()) {
      option.isSelected = index === tabIndex;
    }

    this.optionsConfig.set({ ...optionsConfigValue });
    this.cdr.markForCheck();
  }

  private setOptionsConfig(): void {
    this.optionsConfig.set({
      options: this.config().options.map((option, index) => {
        const type = this.normalizeMenuType(option.type);
        return {
          code: `option${index}`,
          id: `${index}`,
          name: this.translate.instant(option.link?.title ?? `option${index}`),
          link:
            type === MenuType.MENU && option.link?.url
              ? {
                  ...option.link,
                  title: undefined,
                }
              : undefined,
          isSelected: option.isSelected ?? this.isActiveMenuOption(option.link?.url ?? '', type),
          icon: option.icon,
          lang: this.config().culture,
        };
      }),
      accessibilityConfig: {
        id: `authAccountMenuOptions`,
      },
      ariaAttributes: {
        ariaLabel: this.resolveTranslatedValue(
          this.translate.instant(AuthenticatedAccountMenuComponent.ARIA_TRANSLATION_KEY),
          'Account menu',
          AuthenticatedAccountMenuComponent.ARIA_TRANSLATION_KEY
        ),
      },
      mode: 'menu',
    });
    const logoutOption: OptionsList = {
      code: MenuType.LOGOUT,
      id: this.config().options.length.toString(),
      name: this.resolveTranslatedValue(
        this.translate.instant(AuthenticatedAccountMenuComponent.LOGOUT_TRANSLATION_KEY),
        'Log out',
        AuthenticatedAccountMenuComponent.LOGOUT_TRANSLATION_KEY
      ),
      link: undefined,
      icon: {
        name: '',
      },
    };
    const currentConfig = this.optionsConfig();
    if (currentConfig) {
      this.optionsConfig.set({
        ...currentConfig,
        options: [...currentConfig.options, logoutOption],
      });
    }
    this.cdr.markForCheck();
  }

  private setupReactiveTranslations(): void {
    this.translate
      .stream(AuthenticatedAccountMenuComponent.ARIA_TRANSLATION_KEY)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((translated) => {
        const ariaLabel = this.resolveTranslatedValue(
          translated,
          'Account menu',
          AuthenticatedAccountMenuComponent.ARIA_TRANSLATION_KEY
        );
        this.updateAriaLabel(ariaLabel);
      });

    this.translate
      .stream(AuthenticatedAccountMenuComponent.LOGOUT_TRANSLATION_KEY)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((translated) => {
        const logoutLabel = this.resolveTranslatedValue(
          translated,
          'Log out',
          AuthenticatedAccountMenuComponent.LOGOUT_TRANSLATION_KEY
        );
        this.updateLogoutOptionLabel(logoutLabel);
      });
  }

  private resolveTranslatedValue(value: string | null | undefined, fallback: string, key: string): string {
    return value && value !== key ? value : fallback;
  }

  private updateAriaLabel(ariaLabel: string): void {
    const current = this.optionsConfig();
    if (!current) {
      return;
    }

    this.optionsConfig.set({
      ...current,
      ariaAttributes: {
        ...(current.ariaAttributes ?? {}),
        ariaLabel,
      },
    });
    this.cdr.markForCheck();
  }

  private updateLogoutOptionLabel(logoutLabel: string): void {
    const current = this.optionsConfig();
    if (!current) {
      return;
    }

    const updatedOptions = current.options.map((option) =>
      option.code === MenuType.LOGOUT
        ? {
            ...option,
            name: logoutLabel,
          }
        : option
    );

    this.optionsConfig.set({
      ...current,
      options: updatedOptions,
    });
    this.cdr.markForCheck();
  }

  private normalizeMenuType(type?: string): MenuType {
    if (!type) return MenuType.MENU;
    const normalizedType = this.textHelper.toCapitalCase(type);
    return Object.values(MenuType).includes(normalizedType as MenuType) ? (normalizedType as MenuType) : MenuType.MENU;
  }
}
