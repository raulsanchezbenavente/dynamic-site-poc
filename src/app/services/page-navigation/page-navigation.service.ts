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

  public resolvePagePath(pageId: string | number | undefined, fallbackSlug: string, lang?: AppLang): string {
    const currentLang = lang ?? this.routerHelper.language;
    const configPath = this.siteConfig.getPathByPageId(pageId, currentLang);
    if (configPath) return configPath;

    const normalizedFallbackSlug = (fallbackSlug ?? '').replace(/^\/+/, '');
    return `/${currentLang}/${normalizedFallbackSlug}`;
  }

  public navigateByPageId(pageId: string | number | undefined, fallbackSlug: string, lang?: AppLang): Promise<boolean> {
    const targetPath = this.resolvePagePath(pageId, fallbackSlug, lang);
    return this.router.navigateByUrl(targetPath);
  }
}
