import { DOCUMENT } from '@angular/common';
import { inject, Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

import { SiteConfigService } from '../site-config/site-config.service';

type AppLang = 'es' | 'en' | 'fr' | 'pt';

type SeoConfig = {
  title?: string;
  description?: string;
  robots?: string;
  canonical?: string;
};

@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly allowedLangs = new Set<AppLang>(['en', 'es', 'fr', 'pt']);
  private readonly indexablePageIds = new Set(['0', '2']);
  private readonly siteName = 'Avianca';
  private readonly localeByLang: Record<AppLang, string> = {
    es: 'es_ES',
    en: 'en_US',
    fr: 'fr_FR',
    pt: 'pt_PT',
  };

  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly document = inject(DOCUMENT);
  private readonly siteConfig = inject(SiteConfigService);

  public applyPageSeo(path: string | undefined, pageName: string | undefined, seo?: SeoConfig, pageId?: string): void {
    if (this.isSeoDisabledForProxyShell()) {
      return;
    }

    const nextTitle = String(seo?.title ?? pageName ?? '').trim();
    if (nextTitle) {
      this.title.setTitle(nextTitle);
    }
    this.meta.updateTag({ property: 'og:title', content: nextTitle });
    this.meta.updateTag({ name: 'twitter:title', content: nextTitle });

    const nextDescription = String(seo?.description ?? '').trim();
    this.meta.updateTag({ name: 'description', content: nextDescription });
    this.meta.updateTag({ property: 'og:description', content: nextDescription });
    this.meta.updateTag({ name: 'twitter:description', content: nextDescription });

    const nextRobots = this.resolveRobotsPolicy(path, pageId, seo?.robots);
    if (nextRobots) {
      this.meta.updateTag({ name: 'robots', content: nextRobots });
    }

    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:site_name', content: this.siteName });
    this.meta.updateTag({ property: 'og:locale', content: this.resolveLocale(path) });
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });

    const canonicalHref = this.resolveCanonicalUrl(path, seo?.canonical);
    if (canonicalHref) {
      this.upsertCanonical(canonicalHref);
      this.meta.updateTag({ property: 'og:url', content: canonicalHref });
    }

    this.upsertAlternateLinks(pageId, path, canonicalHref);
  }

  private resolveCanonicalUrl(path: string | undefined, canonical?: string): string | null {
    const directCanonical = String(canonical ?? '').trim();
    if (directCanonical) return directCanonical;

    if (!path) return null;
    try {
      return new URL(path, this.document.location?.origin ?? globalThis.location.origin).toString();
    } catch {
      return null;
    }
  }

  private resolveRobotsPolicy(path: string | undefined, pageId: string | undefined, configuredRobots?: string): string {
    if (this.isIndexablePath(path) && this.isIndexablePageId(pageId)) {
      return String(configuredRobots ?? 'index,follow').trim();
    }

    return 'noindex,follow';
  }

  private isIndexablePath(path: string | undefined): boolean {
    const normalizedPath = this.normalizePath(path);
    const segments = normalizedPath.split('/').filter(Boolean);
    if (segments.length < 1) return false;

    const lang = segments[0] as AppLang;
    return this.allowedLangs.has(lang);
  }

  private isIndexablePageId(pageId: string | undefined): boolean {
    return this.indexablePageIds.has(String(pageId ?? '').trim());
  }

  private normalizePath(path: string | undefined): string {
    const fallbackPath = this.document.location?.pathname ?? '/';
    const candidate = String(path ?? fallbackPath).trim();
    if (!candidate) return '/';

    try {
      return new URL(candidate, this.document.location?.origin ?? globalThis.location.origin).pathname;
    } catch {
      return candidate.startsWith('/') ? candidate : `/${candidate}`;
    }
  }

  private upsertCanonical(href: string): void {
    const head = this.document.head;
    if (!head) return;

    let link = head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!link) {
      link = this.document.createElement('link');
      link.setAttribute('rel', 'canonical');
      head.appendChild(link);
    }
    link.setAttribute('href', href);
  }

  private upsertAlternateLinks(
    pageId: string | undefined,
    path: string | undefined,
    canonicalHref: string | null
  ): void {
    const head = this.document.head;
    if (!head) return;

    const currentLang = this.resolveLang(path);
    const normalizedPageId = String(pageId ?? '').trim();
    const alternates: Array<{ lang: string; href: string }> = [];

    if (normalizedPageId) {
      (['es', 'en', 'fr', 'pt'] as AppLang[]).forEach((lang) => {
        const langPath = this.siteConfig.getPathByPageId(normalizedPageId, lang);
        const absoluteHref = this.resolveCanonicalUrl(langPath);
        if (absoluteHref) {
          alternates.push({ lang, href: absoluteHref });
        }
      });
    }

    if (!alternates.length && canonicalHref) {
      alternates.push({ lang: currentLang, href: canonicalHref });
    }

    const xDefaultHref = alternates.find((item) => item.lang === 'es')?.href ?? alternates[0]?.href ?? canonicalHref;
    if (xDefaultHref) {
      alternates.push({ lang: 'x-default', href: xDefaultHref });
    }

    head.querySelectorAll('link[rel="alternate"][data-seo-dynamic="true"]').forEach((node) => node.remove());

    alternates.forEach((item) => {
      const link = this.document.createElement('link');
      link.setAttribute('rel', 'alternate');
      link.setAttribute('hreflang', item.lang);
      link.setAttribute('href', item.href);
      link.setAttribute('data-seo-dynamic', 'true');
      head.appendChild(link);
    });
  }

  private resolveLang(path: string | undefined): AppLang {
    const normalizedPath = this.normalizePath(path);
    const lang = normalizedPath.split('/').filter(Boolean)[0] as AppLang | undefined;
    return lang && this.allowedLangs.has(lang) ? lang : 'es';
  }

  private resolveLocale(path: string | undefined): string {
    return this.localeByLang[this.resolveLang(path)];
  }

  private isSeoDisabledForProxyShell(): boolean {
    const rawValue = this.document.querySelector('meta[name="disable-dynamic-seo"]')?.getAttribute('content');
    return (
      String(rawValue ?? '')
        .trim()
        .toLowerCase() === 'true'
    );
  }
}
