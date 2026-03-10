import { APP_INITIALIZER, ApplicationConfig, mergeApplicationConfig } from '@angular/core';
import { provideServerRendering } from '@angular/platform-server';
import { TranslateService } from '@ngx-translate/core';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { appConfig } from './app.config';
import { AppLang } from './services/site-config/models/langs.model';
import { SiteConfigService } from './services/site-config/site-config.service';

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(),
    {
      provide: APP_INITIALIZER,
      multi: true,
      deps: [SiteConfigService, TranslateService],
      useFactory: (siteConfig: SiteConfigService, translate: TranslateService) => () => {
        const langs: AppLang[] = ['en', 'es', 'fr', 'pt'];
        const configByLang: Partial<Record<AppLang, any[]>> = {};
        const pathname = typeof globalThis.location?.pathname === 'string' ? globalThis.location.pathname : '/en/home';
        const segment = pathname.split('/').filter(Boolean)[0];
        const activeLang: AppLang =
          segment === 'en' || segment === 'es' || segment === 'fr' || segment === 'pt' ? segment : 'en';

        for (const lang of langs) {
          const distPath = join(process.cwd(), 'dist', 'dynamic-site', 'browser', 'assets', 'config-site', lang);
          const srcPath = join(process.cwd(), 'src', 'assets', 'config-site', lang);
          const filePath = existsSync(distPath) ? distPath : srcPath;

          const raw = readFileSync(filePath, 'utf-8');
          const parsed = JSON.parse(raw) as { pages?: any[] };
          configByLang[lang] = Array.isArray(parsed.pages) ? parsed.pages : [];
        }

        const i18nDistPath = join(process.cwd(), 'dist', 'dynamic-site', 'browser', 'assets', 'i18n', activeLang);
        const i18nSrcPath = join(process.cwd(), 'src', 'assets', 'i18n', activeLang);
        const i18nFilePath = existsSync(i18nDistPath) ? i18nDistPath : i18nSrcPath;
        const i18nRaw = readFileSync(i18nFilePath, 'utf-8');
        const i18nParsed = JSON.parse(i18nRaw) as Record<string, any>;

        siteConfig.setSiteConfigByLanguage(configByLang);
        translate.setDefaultLang(activeLang);
        translate.setTranslation(activeLang, i18nParsed, true);
      },
    },
  ],
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
