import { provideHttpClient } from '@angular/common/http';
import { APP_INITIALIZER, ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter, RouteReuseStrategy } from '@angular/router';
import { ANALYTICS_DICTIONARIES, ANALYTICS_EXPECTED_EVENTS, ANALYTICS_EXPECTED_KEYS_MAP } from '@dcx/module/analytics';
import { AccountClient, AccountV2Client, CmsConfigClient } from '@dcx/module/api-clients';
import { MODULE_TRANSLATION_MAP } from '@dcx/module/translation';
import { ANALYTICS_INTERFACES_PROPERTIES, AnalyticsBusiness, AnalyticsEventType } from '@dcx/ui/business-common';
import {
  BUSINESS_CONFIG,
  ConfigService,
  EXCLUDE_SESSION_EXPIRED_URLS,
  initializeKeycloakFactory,
  KeycloakAuthService,
  MODAL_KEY_EVENT_STRATEGIES_PROVIDERS,
  RepositoryRetrieveProxyService,
  ResourcesRetrieveProxyService,
  ResourcesRetrieveService,
  RETRIEVE_ALERTS_DATA_SERVICE,
  RETRIEVE_MARKETS_DATA_SERVICE,
  RETRIEVE_STATIONS_DATA_SERVICE,
  RetrieveAlertsDataFromCms,
  RetrieveMarketsDataFromPss,
  RetrieveStationsDataFromPss,
  TabGuardService,
  TIME_ALERT_EXPIRED_SESSION,
  TIME_EXPIRED_SESSION,
  TIMEOUT_REDIRECT,
} from '@dcx/ui/libs';
import { BUSINESS_CONFIG_MOCK } from '@dcx/ui/mock-repository';
import { APP_LANGS, AppLang, SiteConfigService } from '@navigation';
import { provideTranslateService, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { TRANSLATE_HTTP_LOADER_CONFIG, TranslateHttpLoader } from '@ngx-translate/http-loader';
import { KeycloakService } from 'keycloak-angular';
import { concatMap, firstValueFrom } from 'rxjs';

import { routes } from './app.routes';
import { blockComponentRegistry } from './component-map';
import { AP_APP_PROVIDERS } from './modules/account-profile/src/public-api';
import { BLOCK_COMPONENT_REGISTRY } from './modules/dynamic-composite/block-outlet/block-outlet.component';
import { SamePageIdReuseStrategy } from './same-page-id-reuse.strategy';
import { MODULE_TRANSLATION_MAP_TOKEN } from './translations/module-translation-map.token';

const getLangFromUrl = (): AppLang => {
  const segment = globalThis.location.pathname.split('/').filter(Boolean)[0];
  return APP_LANGS.includes(segment as AppLang) ? (segment as AppLang) : 'en';
};

const shouldClearSiteConfigSessionCacheOnInit = (): boolean => {
  const navigationEntry = globalThis.performance?.getEntriesByType?.('navigation')?.at(0) as
    | PerformanceNavigationTiming
    | undefined;
  const navigationType = navigationEntry?.type;

  return navigationType === 'navigate' || navigationType === 'reload';
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimations(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    KeycloakService,
    AccountClient,
    AccountV2Client,
    CmsConfigClient,
    ...MODAL_KEY_EVENT_STRATEGIES_PROVIDERS,
    { provide: BUSINESS_CONFIG, useValue: BUSINESS_CONFIG_MOCK },
    { provide: BLOCK_COMPONENT_REGISTRY, useValue: blockComponentRegistry },
    { provide: MODULE_TRANSLATION_MAP_TOKEN, useValue: MODULE_TRANSLATION_MAP },
    provideRouter(routes),
    { provide: RouteReuseStrategy, useClass: SamePageIdReuseStrategy },
    {
      provide: APP_INITIALIZER,
      multi: true,
      deps: [SiteConfigService],
      useFactory: (svc: SiteConfigService) => () => {
        if (shouldClearSiteConfigSessionCacheOnInit()) {
          svc.clearPersistedSiteConfigFromSessionStorage();
          console.log('[APP ENTRY][BROWSER] cleared site config session cache before loadSite');
        }

        return firstValueFrom(svc.loadSite([getLangFromUrl()]));
      },
    },
    provideHttpClient(),
    RepositoryRetrieveProxyService,
    ResourcesRetrieveProxyService,
    ResourcesRetrieveService,
    // { provide: RETRIEVE_STATIONS_DATA_SERVICE, useClass: RetrieveStationsDataFromCms },
    { provide: RETRIEVE_STATIONS_DATA_SERVICE, useClass: RetrieveStationsDataFromPss },
    // { provide: RETRIEVE_MARKETS_DATA_SERVICE, useClass: RetrieveMarketsDataFromCms },
    { provide: RETRIEVE_MARKETS_DATA_SERVICE, useClass: RetrieveMarketsDataFromPss },
    { provide: RETRIEVE_ALERTS_DATA_SERVICE, useClass: RetrieveAlertsDataFromCms },
    { provide: EXCLUDE_SESSION_EXPIRED_URLS, useValue: ['/check-in/login/', '/members/home/'] },
    { provide: TIMEOUT_REDIRECT, useValue: '/' },
    { provide: TIME_ALERT_EXPIRED_SESSION, useValue: 480000 },
    { provide: TIME_EXPIRED_SESSION, useValue: 1080000 },
    { provide: ANALYTICS_EXPECTED_KEYS_MAP, useValue: ANALYTICS_INTERFACES_PROPERTIES },
    { provide: ANALYTICS_EXPECTED_EVENTS, useValue: AnalyticsEventType },
    { provide: ANALYTICS_DICTIONARIES, useValue: AnalyticsBusiness },
    ...AP_APP_PROVIDERS,
    {
      provide: APP_INITIALIZER,
      multi: true,
      deps: [ConfigService, TabGuardService, KeycloakAuthService],
      useFactory: (config: ConfigService, tabGuard: TabGuardService, auth: KeycloakAuthService) => () =>
        firstValueFrom(
          config.init().pipe(
            concatMap(() => tabGuard.init()),
            concatMap(() => {
              if (tabGuard.isDuplicate()) {
                console.log('[TabGuard] Duplicate tab detected — skipping Keycloak init.');
                return [];
              }
              return initializeKeycloakFactory(auth)();
            })
          )
        ),
    },

    provideTranslateService({
      defaultLanguage: 'en',
      loader: {
        provide: TranslateLoader,
        useClass: TranslateHttpLoader,
      },
    }),
    {
      provide: TRANSLATE_HTTP_LOADER_CONFIG,
      useValue: {
        prefix: '/assets/i18n/',
        suffix: '',
      },
    },
    {
      provide: APP_INITIALIZER,
      multi: true,
      deps: [TranslateService],
      useFactory: (ts: TranslateService) => () => {
        const lang = getLangFromUrl();

        ts.setDefaultLang(lang);
        return firstValueFrom(ts.use(lang));
      },
    },
  ],
};
