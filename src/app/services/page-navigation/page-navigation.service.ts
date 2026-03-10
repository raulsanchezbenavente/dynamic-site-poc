import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { RouterHelperService } from '../router-helper/router-helper.service';
import { AppLang } from '../site-config/models/langs.model';
import { SiteConfigService } from '../site-config/site-config.service';

@Injectable({
  providedIn: 'root',
})
export class PageNavigationService {
  private readonly router = inject(Router);
  private readonly routerHelper = inject(RouterHelperService);
  private readonly siteConfig = inject(SiteConfigService);

  public navigateByPath(
    path: string,
    external = false,
    targetBlank = false,
    queryParams?: Record<string, string>
  ): Promise<boolean> {
    const normalizedQuery = queryParams
      ? Object.entries(queryParams)
          .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
          .join('&')
      : '';
    const targetPath = normalizedQuery ? `${path}${path.includes('?') ? '&' : '?'}${normalizedQuery}` : path;

    if (targetBlank) {
      globalThis.open(targetPath, '_blank', 'noopener,noreferrer');
      return Promise.resolve(true);
    }

    if (external) {
      globalThis.location.assign(targetPath);
      return Promise.resolve(true);
    }

    return this.router.navigateByUrl(targetPath);
  }

  public resolvePagePath(pageId: string | undefined, lang?: AppLang): string {
    const currentLang = lang ?? this.routerHelper.language;
    const configPath = this.siteConfig.getPathByPageId(pageId, currentLang);
    if (configPath) return configPath;

    return '/en/home';
  }

  public navigateByPageId(
    pageId: string | undefined,
    lang?: AppLang,
    external = false,
    targetBlank = false,
    queryParams?: Record<string, string>
  ): Promise<boolean> {
    const targetPath = this.resolvePagePath(pageId, lang);
    return this.navigateByPath(targetPath, external, targetBlank, queryParams);
  }
}
