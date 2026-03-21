import { provideHttpClient } from '@angular/common/http';
import { APP_INITIALIZER, ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { APP_LANGS, AppLang, SiteConfigService } from '@navigation';
import { provideTranslateService, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { TRANSLATE_HTTP_LOADER_CONFIG, TranslateHttpLoader } from '@ngx-translate/http-loader';
import { firstValueFrom, tap } from 'rxjs';

import { routes } from './app.routes';

function resolveLangFromPathname(pathname: string): AppLang {
  const segment = pathname.split('/').filter(Boolean)[0];
  return APP_LANGS.includes(segment as AppLang) ? (segment as AppLang) : 'en';
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    {
      provide: APP_INITIALIZER,
      multi: true,
      deps: [SiteConfigService],
      useFactory: (svc: SiteConfigService) => () => {
        const lang = resolveLangFromPathname(globalThis.location.pathname);
        return firstValueFrom(
          svc.loadSite([lang]).pipe(
            tap((site) => {
              const routesInConfig = (site?.pages ?? [])
                .map((page) => {
                  if (typeof page === 'object' && page !== null && 'path' in page) {
                    return String((page as { path?: unknown }).path ?? '');
                  }
                  return '';
                })
                .filter(Boolean);
              console.log('[router] routes loaded for lang', lang, routesInConfig);
            })
          )
        );
      },
    },
    provideHttpClient(),

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
        const lang = resolveLangFromPathname(globalThis.location.pathname);

        ts.setDefaultLang(lang);
        return firstValueFrom(ts.use(lang));
      },
    },
  ],
};
