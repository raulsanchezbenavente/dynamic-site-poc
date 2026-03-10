import { DOCUMENT } from '@angular/common';
import { inject, Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

type SeoConfig = {
  title?: string;
  description?: string;
  robots?: string;
  canonical?: string;
};

@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly allowedLangs = new Set(['en', 'es', 'fr', 'pt']);
  private readonly indexablePageIds = new Set(['0', '2']);

  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly document = inject(DOCUMENT);

  public applyPageSeo(path: string | undefined, pageName: string | undefined, seo?: SeoConfig, pageId?: string): void {
    const nextTitle = String(seo?.title ?? pageName ?? '').trim();
    if (nextTitle) {
      this.title.setTitle(nextTitle);
      this.meta.updateTag({ property: 'og:title', content: nextTitle });
      this.meta.updateTag({ name: 'twitter:title', content: nextTitle });
    }

    const nextDescription = String(seo?.description ?? '').trim();
    if (nextDescription) {
      this.meta.updateTag({ name: 'description', content: nextDescription });
      this.meta.updateTag({ property: 'og:description', content: nextDescription });
      this.meta.updateTag({ name: 'twitter:description', content: nextDescription });
    }

    const nextRobots = this.resolveRobotsPolicy(path, pageId, seo?.robots);
    if (nextRobots) {
      this.meta.updateTag({ name: 'robots', content: nextRobots });
    }

    const canonicalHref = this.resolveCanonicalUrl(path, seo?.canonical);
    if (canonicalHref) {
      this.upsertCanonical(canonicalHref);
      this.meta.updateTag({ property: 'og:url', content: canonicalHref });
    }
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

    const lang = segments[0];
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
}
