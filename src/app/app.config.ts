import { provideHttpClient } from '@angular/common/http';
import { APP_INITIALIZER, ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter, RouteReuseStrategy } from '@angular/router';
import { AccountClient, AccountV2Client, CmsConfigClient } from '@dcx/module/api-clients';
import {
  BUSINESS_CONFIG,
  ConfigService,
  initializeKeycloakFactory,
  KeycloakAuthService,
  MODAL_KEY_EVENT_STRATEGIES_PROVIDERS,
  TabGuardService,
} from '@dcx/ui/libs';
import { BUSINESS_CONFIG_MOCK } from '@dcx/ui/mock-repository';
import { APP_LANGS, AppLang, SiteConfigService } from '@navigation';
import { provideTranslateService, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { TRANSLATE_HTTP_LOADER_CONFIG, TranslateHttpLoader } from '@ngx-translate/http-loader';
import { KeycloakService } from 'keycloak-angular';
import { concatMap, firstValueFrom } from 'rxjs';

import { routes } from './app.routes';
import { blockComponentRegistry } from './component-map';
import { BLOCK_COMPONENT_REGISTRY } from './modules/dynamic-composite/block-outlet/block-outlet.component';
import { SamePageIdReuseStrategy } from './same-page-id-reuse.strategy';
import { MODULE_TRANSLATION_MAP } from './translations/module-translation-map';
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
