import { provideHttpClient } from '@angular/common/http';
import { APP_INITIALIZER, ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, RouteReuseStrategy } from '@angular/router';
import { TabGuardService } from '@dcx/ui/libs';
import { APP_LANGS, AppLang, KeycloakAuthService, SiteConfigService } from '@navigation';
import { provideTranslateService, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { TRANSLATE_HTTP_LOADER_CONFIG, TranslateHttpLoader } from '@ngx-translate/http-loader';
import { firstValueFrom } from 'rxjs';

import { routes } from './app.routes';
import { blockComponentRegistry } from './component-map';
import { BLOCK_COMPONENT_REGISTRY } from './modules/dynamic-composite/block-outlet/block-outlet.component';
import { SamePageIdReuseStrategy } from './same-page-id-reuse.strategy';

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
    provideZoneChangeDetection({ eventCoalescing: true }),
    { provide: BLOCK_COMPONENT_REGISTRY, useValue: blockComponentRegistry },
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
      deps: [TabGuardService, KeycloakAuthService],
      useFactory: (tabGuard: TabGuardService, auth: KeycloakAuthService) => async () => {
        await firstValueFrom(tabGuard.init());

        if (tabGuard.isDuplicate()) {
          console.log('[TabGuard] Duplicate tab detected — skipping Keycloak init.');
          return;
        }

        try {
          await auth.ensureInitialized();
          console.log('[Keycloak] initialized, authenticated:', auth.isAuthenticated());
        } catch (err) {
          console.warn('[Keycloak] skipped at startup:', err);
        }
      },
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
