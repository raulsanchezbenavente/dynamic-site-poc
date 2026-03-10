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

  public resolvePagePath(pageId: string | undefined, lang?: AppLang): string {
    const currentLang = lang ?? this.routerHelper.language;
    const configPath = this.siteConfig.getPathByPageId(pageId, currentLang);
    if (configPath) return configPath;

    return `/${currentLang}/home`;
  }

  public navigateByPageId(pageId: string | undefined, lang?: AppLang, external = false): Promise<boolean> {
    const targetPath = this.resolvePagePath(pageId, lang);
    if (external) {
      globalThis.location.assign(targetPath);
      return Promise.resolve(true);
    }

    return this.router.navigateByUrl(targetPath);
  }
}
