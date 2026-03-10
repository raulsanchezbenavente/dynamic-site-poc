import { isPlatformServer } from '@angular/common';
import { provideHttpClient } from '@angular/common/http';
import { APP_INITIALIZER, ApplicationConfig, PLATFORM_ID, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideTranslateService, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { TRANSLATE_HTTP_LOADER_CONFIG, TranslateHttpLoader } from '@ngx-translate/http-loader';
import { firstValueFrom } from 'rxjs';

import { routes } from './app.routes';
import { SiteConfigService } from './services/site-config/site-config.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    {
      provide: APP_INITIALIZER,
      multi: true,
      deps: [SiteConfigService, PLATFORM_ID],
      useFactory: (svc: SiteConfigService, platformId: object) => () => {
        if (isPlatformServer(platformId)) {
          return Promise.resolve();
        }
        return firstValueFrom(svc.loadSite(['en', 'es', 'fr', 'pt']));
      },
    },
    provideHttpClient(),

    provideTranslateService({
      fallbackLang: 'en',
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
      deps: [TranslateService, PLATFORM_ID],
      useFactory: (ts: TranslateService, platformId: object) => () => {
        const pathname = typeof globalThis.location?.pathname === 'string' ? globalThis.location.pathname : '/en/home';
        const segment = pathname.split('/').filter(Boolean)[0];
        const lang = segment === 'en' || segment === 'es' || segment === 'fr' || segment === 'pt' ? segment : 'en';

        ts.setDefaultLang(lang);
        if (isPlatformServer(platformId)) {
          return Promise.resolve();
        }
        return firstValueFrom(ts.use(lang));
      },
    },
  ],
};
