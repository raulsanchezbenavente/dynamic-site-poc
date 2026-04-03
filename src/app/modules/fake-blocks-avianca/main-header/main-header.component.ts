import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import {
    ChangeDetectionStrategy,
    Component,
    computed,
    effect,
    HostListener,
    inject,
    input,
    OnDestroy,
    OnInit,
    signal,
} from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { DynamicPageReadinessBase, DynamicPageReadyState } from '@dynamic-composite';
import {
    AppLang,
    KeycloakAuthService,
    LanguageSwitchService,
    PageNavigationService,
    RouterHelperService,
    SiteConfigService,
} from '@navigation';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subject, filter, takeUntil } from 'rxjs';

import { SessionApiService } from '../account-profile/services/session-api.service';
import { LoyaltyTone, LoyaltyToneService } from '../loyalty-tone.service';

import { MainHeaderConfig } from './models/main-header-config.model';
import { HeaderMenuItem, Lang } from './models/main-header.models';
import { DEFAULT_MENU, LANGS } from './translations/main-header.constants';

@Component({
  selector: 'main-header',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './main-header.component.html',
  styleUrls: ['./main-header.component.scss'],
})
export class MainHeaderComponent extends DynamicPageReadinessBase implements OnInit, OnDestroy {
  private readonly siteConfig = inject(SiteConfigService);
  private readonly languageSwitch = inject(LanguageSwitchService);
  private readonly pageNavigation = inject(PageNavigationService);
  private readonly routerHelper = inject(RouterHelperService);
  private readonly auth = inject(KeycloakAuthService);
  private readonly router = inject(Router);
  private readonly http = inject(HttpClient);
  private readonly translate = inject(TranslateService);
  private readonly loyaltyToneSvc = inject(LoyaltyToneService);
  private readonly sessionApi = inject(SessionApiService);
  private readonly destroy$ = new Subject<void>();
  private readonly headerTone = signal<LoyaltyTone | null>(this.loyaltyToneSvc.tone());
  private readonly sessionUserName = signal('');
  private readonly sessionUserMiles = signal('');
  private readonly currentUrl = signal(this.router.url);

  public config = input<MainHeaderConfig | null>(null);
  public market = input<string>('Colombia (COP)');
  public userName = input<string>('Perico');
  public userMiles = input<string>('600,700');
  public displayUserName = computed(() => this.sessionUserName() || this.userName());
  public displayUserMiles = computed(() => this.sessionUserMiles() || this.userMiles());
  public headerAccentColor = computed(() => this.getToneColor(this.headerTone()));

  public marketOpen = signal(false);
  public markets: Array<{ labelKey: string; currency: string; flagCode: string }> = [
    { labelKey: 'HEADER.MARKET_ARGENTINA', currency: 'ARS', flagCode: '1f1e6-1f1f7' },
    { labelKey: 'HEADER.MARKET_BOLIVIA', currency: 'USD', flagCode: '1f1e7-1f1f4' },
    { labelKey: 'HEADER.MARKET_BRAZIL', currency: 'BRL', flagCode: '1f1e7-1f1f7' },
    { labelKey: 'HEADER.MARKET_CANADA', currency: 'USD', flagCode: '1f1e8-1f1e6' },
    { labelKey: 'HEADER.MARKET_CHILE', currency: 'USD', flagCode: '1f1e8-1f1f1' },
    { labelKey: 'HEADER.MARKET_COLOMBIA', currency: 'COP', flagCode: '1f1e8-1f1f4' },
    { labelKey: 'HEADER.MARKET_COSTA_RICA', currency: 'USD', flagCode: '1f1e8-1f1f7' },
    { labelKey: 'HEADER.MARKET_ECUADOR', currency: 'USD', flagCode: '1f1ea-1f1e8' },
    { labelKey: 'HEADER.MARKET_EL_SALVADOR', currency: 'USD', flagCode: '1f1f8-1f1fb' },
    { labelKey: 'HEADER.MARKET_SPAIN', currency: 'EUR', flagCode: '1f1ea-1f1f8' },
    { labelKey: 'HEADER.MARKET_UNITED_STATES', currency: 'USD', flagCode: '1f1fa-1f1f8' },
    { labelKey: 'HEADER.MARKET_GUATEMALA', currency: 'USD', flagCode: '1f1ec-1f1f9' },
    { labelKey: 'HEADER.MARKET_HONDURAS', currency: 'USD', flagCode: '1f1ed-1f1f3' },
    { labelKey: 'HEADER.MARKET_MEXICO', currency: 'USD', flagCode: '1f1f2-1f1fd' },
    { labelKey: 'HEADER.MARKET_NICARAGUA', currency: 'USD', flagCode: '1f1f3-1f1ee' },
    { labelKey: 'HEADER.MARKET_PANAMA', currency: 'USD', flagCode: '1f1f5-1f1e6' },
    { labelKey: 'HEADER.MARKET_PARAGUAY', currency: 'USD', flagCode: '1f1f5-1f1fe' },
    { labelKey: 'HEADER.MARKET_PERU', currency: 'USD', flagCode: '1f1f5-1f1ea' },
    { labelKey: 'HEADER.MARKET_UNITED_KINGDOM', currency: 'GBP', flagCode: '1f1ec-1f1e7' },
    { labelKey: 'HEADER.MARKET_DOMINICAN_REPUBLIC', currency: 'USD', flagCode: '1f1e9-1f1f4' },
    { labelKey: 'HEADER.MARKET_URUGUAY', currency: 'USD', flagCode: '1f1fa-1f1fe' },
    { labelKey: 'HEADER.MARKET_OTHER_COUNTRIES', currency: 'USD', flagCode: '1f30e' },
  ];
  public selectedMarketKey = signal<string>('HEADER.MARKET_COLOMBIA');
  public selectedCurrency = signal<string>('COP');
  public pendingMarketKey = signal<string>('HEADER.MARKET_COLOMBIA');
  public pendingCurrency = signal<string>('COP');
  public selectedMarketFlagUrl = computed(() => {
    const code = this.markets.find((m) => m.labelKey === this.selectedMarketKey())?.flagCode ?? '1f30e';
    return this.flagUrl(code);
  });
  public langTick = signal(0);
  public selectedMarketLabel = computed(() => {
    this.langTick();
    return this.translate.instant(this.selectedMarketKey());
  });
  public marketTitleLabel = computed(() => {
    this.langTick();
    return this.translate.instant('HEADER.MARKET_TITLE');
  });
  public marketApplyLabel = computed(() => {
    this.langTick();
    return this.translate.instant('HEADER.MARKET_APPLY');
  });
  public marketCloseLabel = computed(() => {
    this.langTick();
    return this.translate.instant('HEADER.MARKET_CLOSE');
  });
  public marketView = computed(() => {
    this.langTick();
    return this.markets.map((item) => ({
      ...item,
      label: this.translate.instant(item.labelKey),
      flagUrl: this.flagUrl(item.flagCode),
    }));
  });

  public langOpen = signal(false);
  public langs = LANGS;
  public activeLang = signal<AppLang>(this.routerHelper.language);
  public isAuthenticated = computed(() => this.auth.isAuthenticated());
  public activeLangLabelKey = computed(() => {
    const code = this.activeLang();
    return this.langs.find((l) => l.code === code)?.label ?? 'HEADER.EN';
  });

  public ngOnInit(): void {
    this.router.events
      .pipe(
        filter((e) => e instanceof NavigationEnd),
        takeUntil(this.destroy$),
      )
      .subscribe((e) => this.currentUrl.set((e as NavigationEnd).urlAfterRedirects));

    this.routerHelper.languageChange$.pipe(takeUntil(this.destroy$)).subscribe((lang: AppLang) => {
      this.activeLang.set(lang);
    });

    this.translate.onLangChange.pipe(takeUntil(this.destroy$)).subscribe(() => this.langTick.update((v) => v + 1));

    const storedMarketKey = this.getStoredMarketKey();
    if (storedMarketKey) {
      const storedMarket = this.markets.find((item) => item.labelKey === storedMarketKey);
      if (storedMarket) {
        this.selectedMarketKey.set(storedMarket.labelKey);
        this.selectedCurrency.set(storedMarket.currency);
      }
    } else {
      const marketMatch = /^(.*)\(([^)]+)\)/.exec(this.market());
      if (marketMatch) {
        const name = marketMatch[1].trim();
        const currency = marketMatch[2].trim();
        const match = this.markets.find((item) => {
          const translated = this.translate.instant(item.labelKey).trim();
          return translated.toLowerCase() === name.toLowerCase();
        });
        if (match) {
          this.selectedMarketKey.set(match.labelKey);
          this.selectedCurrency.set(currency);
        }
      }
    }

    this.pendingMarketKey.set(this.selectedMarketKey());
    this.pendingCurrency.set(this.selectedCurrency());
    const qp = this.router.url.split('?')[1] ?? '';
    const activeTab = new URLSearchParams(qp).get('activeTab') ?? undefined;
    if (activeTab) {
      this.markMenuItemAsActive(activeTab);
    } else {
      const currentPageId: string | undefined = this.routerHelper.getCurrentPageId();
      if (currentPageId) {
        const match = this.items().find((item) => item.pageId === currentPageId);
        if (match?.label) {
          this.selectedMenuLabel.set(match.label);
        }
      }
    }

    globalThis.addEventListener('activeChange', (event) => {
      const customEvent = event as CustomEvent<{ tab: { name: string } }>;
      const tabName = customEvent.detail?.tab?.name;
      if (tabName) {
        this.markMenuItemAsActive(tabName);
      }
    });

    void this.loadSessionData();
  }

  constructor() {
    super();
    effect((onCleanup) => {
      const lang = this.activeLang();
      const pageId = String(this.routerHelper.getCurrentPageId() ?? '');
      const blockConfig = pageId
        ? this.siteConfig.getBlockConfig(pageId, 'CorporateMainHeaderBlock_uiplus', lang)
        : null;
      const url = String(blockConfig?.['url'] ?? this.config()?.url ?? this.getDefaultToneUrl(lang)).trim();

      if (!url) {
        // Keep previous tone while config/url settles to avoid UI flicker.
        this.emitDynamicPageReady(DynamicPageReadyState.RENDERED);
        return;
      }

      const subscription = this.http.get(url, { responseType: 'text' }).subscribe({
        next: (responseText) => {
          const tone = this.resolveTone(this.parseTonePayload(responseText));
          if (tone) {
            this.headerTone.set(tone);
            this.loyaltyToneSvc.tone.set(tone);
          }
          this.emitDynamicPageReady(DynamicPageReadyState.LOADED);
        },
        error: () => {
          // Keep previous tone on transient request errors.
          this.emitDynamicPageReady(DynamicPageReadyState.ERROR);
        },
      });

      onCleanup(() => subscription.unsubscribe());
    });
  }

  private getDefaultToneUrl(lang: AppLang): string {
    return `/assets/config/loyalty/${lang}`;
  }

  public markMenuItemAsActive(activeTab: string): void {
    const normalized = activeTab.trim().toLowerCase();
    const list = this.items();
    const match = list.find((item) => {
      const keyMatch = item.label?.trim().toLowerCase() === normalized;
      if (keyMatch) return true;
      const translated = this.translate
        .instant(item.label ?? '')
        .trim()
        .toLowerCase();
      return translated === normalized;
    });
    if (match?.label) {
      this.selectedMenuLabel.set(match?.label);
    }
  }

  public setLang(lang: AppLang): void {
    this.langOpen.set(false);
    this.languageSwitch.switchLanguage(lang).subscribe({
      next: () => {
        this.activeLang.set(lang);
      },
      error: (error) => {
        console.error('[MAIN HEADER] Language switch error', error);
      },
    });
  }

  public logRouterAndSiteConfig(): void {
    console.log('[HEADER][MANUAL LOG] router.config', this.router.config);
    console.log('[HEADER][MANUAL LOG] site config', this.siteConfig.siteSnapshot);
  }

  public trackByLang(_: number, l: Lang): AppLang {
    return l.code;
  }

  public async authAction(): Promise<void> {
    await this.auth.ensureInitialized();

    if (this.auth.isAuthenticated()) {
      await this.auth.logout(this.buildLogoutRedirectUri());
      this.open.set(false);
      return;
    }

    await this.auth.login();
  }

  private buildLogoutRedirectUri(): string {
    const lang = this.activeLang();
    const currentUrl = new URL(globalThis.location.href);
    const homePath = this.pageNavigation.resolvePagePath('0', lang) || `/${lang}/home`;
    const currentPath = currentUrl.pathname.trim();
    const path = currentPath && currentPath.startsWith('/') ? currentPath : homePath;

    const redirectUrl = new URL(path, globalThis.location.origin);
    const activeTab = currentUrl.searchParams.get('activeTab')?.trim();
    if (activeTab) {
      redirectUrl.searchParams.set('activeTab', activeTab);
    }

    return redirectUrl.toString();
  }

  public toggleLangMenu(ev: MouseEvent): void {
    ev.stopPropagation();
    this.open.set(false);
    this.marketOpen.set(false);
    this.langOpen.update((v) => !v);
  }

  public menuItems = input<HeaderMenuItem[] | null | undefined>(DEFAULT_MENU);

  public open = signal(false);
  public selectedMenuLabel = signal<string | null>(null);

  public nextTestPagePath = computed<string | null>(() => {
    const url = this.currentUrl().split('?')[0];
    const match = /\/en\/corporative(\d+)$/.exec(url);
    if (!match) return null;
    const next = Number(match[1]) + 1;
    return `/en/corporative${next}`;
  });

  public navigateToNextTestPage(): void {
    const path = this.nextTestPagePath();
    if (path) {
      void this.router.navigate([path]);
    }
  }

  // Always returns a non-empty array if nothing is provided
  public items = computed(() => {
    const v = this.menuItems();
    const list = Array.isArray(v) && v.length ? v : DEFAULT_MENU;
    const selected = this.selectedMenuLabel();
    return list.map((item) => ({
      ...item,
      checked: selected ? item.label === selected : !!item.checked,
    }));
  });

  // Close on outside click + ESC
  @HostListener('document:click')
  public onDocumentClick(): void {
    this.open.set(false);
    this.langOpen.set(false);
    this.marketOpen.set(false);
  }

  @HostListener('document:keydown.escape')
  public onEsc(): void {
    this.open.set(false);
    this.langOpen.set(false);
    this.marketOpen.set(false);
  }

  public ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  public toggleMenu(ev: MouseEvent): void {
    ev.stopPropagation();
    this.langOpen.set(false);
    this.marketOpen.set(false);
    this.open.update((v) => !v);
  }

  public toggleMarketMenu(ev: MouseEvent): void {
    ev.stopPropagation();
    this.langOpen.set(false);
    this.open.set(false);
    this.pendingMarketKey.set(this.selectedMarketKey());
    this.pendingCurrency.set(this.selectedCurrency());
    this.marketOpen.update((v) => !v);
  }

  public closeMarketMenu(): void {
    this.marketOpen.set(false);
  }

  public setMarket(item: { labelKey: string; currency: string }): void {
    this.pendingMarketKey.set(item.labelKey);
    this.pendingCurrency.set(item.currency);
  }

  public applyMarket(): void {
    const nextKey = this.pendingMarketKey();
    const nextCurrency = this.pendingCurrency();
    this.selectedMarketKey.set(nextKey);
    this.selectedCurrency.set(nextCurrency);
    this.persistMarketKey(nextKey);
    this.marketOpen.set(false);
  }

  private flagUrl(code: string): string {
    return `https://twemoji.maxcdn.com/v/latest/svg/${code}.svg`;
  }

  private getStoredMarketKey(): string | null {
    if (typeof sessionStorage === 'undefined') return null;
    return sessionStorage.getItem('avianca.pos');
  }

  private persistMarketKey(marketKey: string): void {
    if (typeof sessionStorage === 'undefined') return;
    sessionStorage.setItem('avianca.pos', marketKey);
  }

  public trackByMarket(_: number, item: { labelKey: string }): string {
    return item.labelKey;
  }

  public trackByLabel(_: number, item: HeaderMenuItem): string {
    return item.label;
  }

  public redirectTo(item: HeaderMenuItem): void {
    this.open.set(false);
    this.selectedMenuLabel.set(item.label);

    if (item.redirectTo) {
      void this.pageNavigation.navigateByPath(item.redirectTo, item.external ?? false, item.targetBlank ?? false);
      return;
    }

    const lang: AppLang = this.activeLang();

    const tabName: string | undefined =
      item.tabsId && item.tabId
        ? this.siteConfig
            .getTabNamesByTabsId(item.tabsId, lang)
            .find((t) => String(t.tabId ?? '') === String(item.tabId))?.name
        : undefined;
    const tabParams = tabName ? { activeTab: tabName } : null;

    if (item.pageId) {
      if (item.external || item.targetBlank) {
        void this.pageNavigation.navigateByPageId(
          item.pageId,
          lang,
          true,
          item.targetBlank ?? false,
          tabParams ?? undefined
        );
        return;
      }

      const currentPageId: string | undefined = this.routerHelper.getCurrentPageId();
      if (currentPageId === item.pageId) {
        if (tabParams) {
          // this.router.navigate([], { queryParams: tabParams, queryParamsHandling: 'merge' });
        }
        this.routerHelper.changeActiveTab(item.tabId ?? '');
      } else {
        if (tabParams) {
          if (item.externalTab) {
            void this.pageNavigation.navigateByPageId(item.pageId, lang, true, item.targetBlank ?? false, tabParams);
          } else {
            const path = this.pageNavigation.resolvePagePath(item.pageId, lang);
            void this.router.navigate([path], { queryParams: tabParams });
          }
        } else {
          void this.pageNavigation.navigateByPageId(item.pageId, lang);
        }
      }
    }
  }

  public homePath(): string {
    const lang = this.activeLang();
    return this.pageNavigation.resolvePagePath('0', lang);
  }

  public goHome(event: MouseEvent): void {
    event.preventDefault();
    void this.pageNavigation.navigateByPath(this.homePath(), true);
  }

  private resolveTone(payload: unknown): LoyaltyTone | null {
    const normalizedFromPayload = this.normalizeTone(payload);
    if (normalizedFromPayload) {
      return normalizedFromPayload;
    }

    if (payload && typeof payload === 'object') {
      const stack: unknown[] = [payload];
      const visited = new Set<unknown>();

      while (stack.length > 0) {
        const current = stack.pop();
        if (!current || typeof current !== 'object' || visited.has(current)) {
          continue;
        }

        visited.add(current);
        for (const value of Object.values(current)) {
          const normalized = this.normalizeTone(value);
          if (normalized) {
            return normalized;
          }

          if (value && typeof value === 'object') {
            stack.push(value);
          }
        }
      }
    }

    return null;
  }

  private normalizeTone(value: unknown): LoyaltyTone | null {
    if (typeof value !== 'string') {
      return null;
    }

    const normalized = value.trim().toLowerCase();
    if (normalized === 'gold') {
      return 'gold';
    }

    if (normalized === 'silver') {
      return 'silver';
    }

    if (normalized === 'blue') {
      return 'blue';
    }

    if (normalized === 'red') {
      return 'red';
    }

    return null;
  }

  private parseTonePayload(raw: string): unknown {
    const trimmed = String(raw || '').trim();
    if (!trimmed) {
      return null;
    }
    try {
      return JSON.parse(trimmed);
    } catch {
      return trimmed;
    }
  }

  private emitDynamicPageReady(state: DynamicPageReadyState): void {
    this.emitDynamicPageReadyEvent({
      config: (this.config() ?? null) as Record<string, unknown> | null,
      fallbackComponent: 'CorporateMainHeaderBlock_uiplus',
      state,
    });
  }

  private async loadSessionData(): Promise<void> {
    const data = await this.sessionApi.getSessionData();
    if (!data) {
      return;
    }

    const fullName = this.sessionApi.formatPersonName([data.firstName, data.middleName, data.lastName]);
    const milesAmount = Number(data.balance?.lifemiles?.amount || 0);

    this.sessionUserName.set(fullName);
    this.sessionUserMiles.set(new Intl.NumberFormat('es-CO').format(milesAmount));
  }

  private getToneColor(tone: LoyaltyTone | null): string {
    if (!tone) {
      return 'transparent';
    }

    if (tone === 'red') {
      return '#e2007a';
    }

    if (tone === 'gold') {
      return '#d4a52a';
    }

    if (tone === 'silver') {
      return '#7a8fa6';
    }

    if (tone === 'blue') {
      return '#2e86ff';
    }

    return 'transparent';
  }
}
