import { DOCUMENT } from '@angular/common';
import { inject, Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute, Data, Router } from '@angular/router';

import { environment } from '../../../environments/environment';
import { AppLang } from '../site-config/models/langs.model';
import { SiteConfigService } from '../site-config/site-config.service';

@Injectable({
  providedIn: 'root',
})
export class SeoService {
  private readonly document = inject(DOCUMENT);
  private readonly meta = inject(Meta);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly siteConfig = inject(SiteConfigService);
  private readonly title = inject(Title);

  private readonly supportedLangs: AppLang[] = ['en', 'es', 'fr', 'pt'];

  private get origin(): string {
    return environment.siteOrigin || this.document.location?.origin || '';
  }

  public update(url?: string): void {
    const locationPath = this.normalizeUrl(globalThis.location?.pathname ?? '');
    const locationSearch = globalThis.location?.search ?? '';
    const effectiveUrl =
      locationPath !== '/' ? `${locationPath}${locationSearch}` : this.normalizeUrl(url ?? this.router.url);
    const urlAfterRedirects = this.normalizeUrl(effectiveUrl);
    const routeData = this.getLeafRouteData();
    const pageName = this.getPageName(routeData) || this.getPageNameByPath(urlAfterRedirects.split('?')[0]);

    const title = pageName ? `${pageName} | Dynamic Flight Site` : 'Dynamic Flight Site';
    const description = pageName
      ? `Discover ${pageName.toLowerCase()} in our dynamic flight booking experience.`
      : 'Dynamic flight booking website powered by Angular and CMS configuration.';

    const absoluteUrl = `${this.origin}${urlAfterRedirects}`;

    this.title.setTitle(title);
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ property: 'og:title', content: title });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:url', content: absoluteUrl });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: title });
    this.meta.updateTag({ name: 'twitter:description', content: description });

    this.upsertLink('canonical', absoluteUrl);

    const pathNoQuery = urlAfterRedirects.split('?')[0] || '/';
    const currentLang = this.resolveCurrentLang(pathNoQuery);
    const currentPageId = this.getPageIdByPath(pathNoQuery);
    for (const lang of this.supportedLangs) {
      const resolvedPath = currentPageId ? this.siteConfig.getPathByPageId(currentPageId, lang) : undefined;
      const localizedPath = resolvedPath ? `/${resolvedPath}` : this.replaceLang(pathNoQuery, currentLang, lang);
      const href = `${this.origin}${localizedPath}`;
      this.upsertLink('alternate', href, lang);
    }

    const defaultPath = currentPageId ? this.siteConfig.getPathByPageId(currentPageId, 'en') : undefined;
    const xDefaultPath = defaultPath ? `/${defaultPath}` : this.replaceLang(pathNoQuery, currentLang, 'en');
    const xDefaultHref = `${this.origin}${xDefaultPath}`;
    this.upsertLink('alternate', xDefaultHref, 'x-default');
  }

  private getLeafRouteData(): Data {
    let current = this.route;
    while (current.firstChild) {
      current = current.firstChild;
    }
    return current.snapshot.data ?? {};
  }

  private getPageName(data: Data): string {
    const value = data['pageName'];
    return typeof value === 'string' ? value : '';
  }

  private getPageNameByPath(path: string): string {
    const normalized = path.replace(/^\/+/, '');
    const pages = this.siteConfig.siteSnapshot?.pages;
    if (!Array.isArray(pages)) return '';
    const match = pages.find((page: { path?: unknown; name?: unknown }) => String(page?.path ?? '') === normalized);
    return typeof match?.name === 'string' ? match.name : '';
  }

  private getPageIdByPath(path: string): string | undefined {
    const normalized = path.replace(/^\/+/, '');
    const pages = this.siteConfig.siteSnapshot?.pages;
    if (!Array.isArray(pages)) return undefined;
    const match = pages.find((page: { path?: unknown; pageId?: unknown }) => String(page?.path ?? '') === normalized);
    if (match?.pageId === undefined || match?.pageId === null) return undefined;
    return String(match.pageId);
  }

  private normalizeUrl(url: string): string {
    if (!url) return '/';
    return url.startsWith('/') ? url : `/${url}`;
  }

  private resolveCurrentLang(path: string): AppLang {
    const segment = path.split('/').filter(Boolean)[0];
    if (segment === 'en' || segment === 'es' || segment === 'fr' || segment === 'pt') {
      return segment;
    }
    return 'en';
  }

  private replaceLang(path: string, currentLang: AppLang, targetLang: AppLang): string {
    const normalized = path.startsWith('/') ? path : `/${path}`;
    const langPrefix = `/${currentLang}`;
    if (normalized.startsWith(`${langPrefix}/`) || normalized === langPrefix) {
      return normalized.replace(langPrefix, `/${targetLang}`);
    }
    return `/${targetLang}${normalized === '/' ? '/home' : normalized}`;
  }

  private upsertLink(rel: string, href: string, hreflang?: string): void {
    const selector = hreflang ? `link[rel="${rel}"][hreflang="${hreflang}"]` : `link[rel="${rel}"]:not([hreflang])`;

    let linkEl = this.document.head.querySelector(selector) as HTMLLinkElement | null;
    if (!linkEl) {
      linkEl = this.document.createElement('link');
      linkEl.setAttribute('rel', rel);
      if (hreflang) linkEl.setAttribute('hreflang', hreflang);
      this.document.head.appendChild(linkEl);
    }

    linkEl.setAttribute('href', href);
  }
}
