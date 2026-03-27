import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';

import { RteInjectorConfig } from './models/rte-injector-config.model';

type ContentFetchResult = {
  url: string;
  content: string;
  ok: boolean;
};

type ContentRequestsFinishedDetail = {
  batchId: string;
  componentId: string;
  requested: number;
  succeeded: number;
  failed: number;
  durationMs: number;
  requestedUrls: string[];
};

@Component({
  selector: 'rte-injector',
  standalone: true,
  templateUrl: './rte-injector.component.html',
  styleUrl: './rte-injector.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RteInjectorComponent {
  private static readonly loadedStylesheetUrls = new Set<string>();
  private static readonly contentCache = new Map<string, string>();

  private readonly document = inject(DOCUMENT);
  private readonly fetchedContent = signal('');

  public readonly config = input<RteInjectorConfig | null | undefined>(undefined);
  public readonly htmlContent = computed(() => {
    const staticContent = this.getStaticContent(this.config());
    const remoteContent = this.fetchedContent().trim();

    if (staticContent && remoteContent) {
      return `${staticContent}\n${remoteContent}`;
    }

    return staticContent || remoteContent;
  });
  public readonly hasContent = computed(() => this.htmlContent().trim().length > 0);

  constructor() {
    effect((onCleanup) => {
      const urls = this.getContentUrls(this.config());

      if (urls.length === 0) {
        this.fetchedContent.set('');
        return;
      }

      const cacheKey = this.getContentCacheKey(urls, false);
      const localeAgnosticCacheKey = this.getContentCacheKey(urls, true);
      const cachedContent =
        RteInjectorComponent.contentCache.get(cacheKey) ?? RteInjectorComponent.contentCache.get(localeAgnosticCacheKey);

      if (cachedContent && cachedContent.trim().length > 0) {
        this.fetchedContent.set(cachedContent);
      }

      const controller = new AbortController();
      let isDisposed = false;

      void (async (): Promise<void> => {
        const startedAt = Date.now();
        const contents = await Promise.all(urls.map(async (url) => this.fetchContent(url, controller.signal)));
        if (isDisposed) {
          return;
        }

        this.logContentRequestCompletion(contents, startedAt);

        const mergedContent = contents.map((entry) => entry.content).filter((entry) => entry.length > 0).join('\n');
        if (mergedContent.trim().length > 0) {
          this.fetchedContent.set(mergedContent);
          RteInjectorComponent.contentCache.set(cacheKey, mergedContent);
          RteInjectorComponent.contentCache.set(localeAgnosticCacheKey, mergedContent);
        }
      })();

      onCleanup(() => {
        isDisposed = true;
        controller.abort();
      });
    });

    effect((onCleanup) => {
      if (!this.hasRenderableContentSource(this.config())) {
        return;
      }

      const entries = this.getCssEntries(this.config());
      if (entries.length === 0) {
        return;
      }

      const createdStyleNodes: HTMLStyleElement[] = [];

      for (const entry of entries) {
        if (this.looksLikeStylesheetUrl(entry)) {
          const normalizedEntry = this.normalizeStylesheetUrl(entry);

          if (
            RteInjectorComponent.loadedStylesheetUrls.has(normalizedEntry) ||
            this.findExistingStylesheetLink(normalizedEntry)
          ) {
            RteInjectorComponent.loadedStylesheetUrls.add(normalizedEntry);
            continue;
          }

          const link = this.document.createElement('link');
          link.rel = 'stylesheet';
          link.href = normalizedEntry;
          link.setAttribute('data-rte-injector', 'true');
          this.document.head.appendChild(link);
          RteInjectorComponent.loadedStylesheetUrls.add(normalizedEntry);
          continue;
        }

        if (this.findExistingStyleTag(entry)) {
          continue;
        }

        const style = this.document.createElement('style');
        style.type = 'text/css';
        style.setAttribute('data-rte-injector', 'true');
        style.textContent = entry;
        this.document.head.appendChild(style);
        createdStyleNodes.push(style);
      }

      onCleanup(() => {
        for (const node of createdStyleNodes) {
          node.remove();
        }
      });
    });
  }

  private getStaticContent(config: RteInjectorConfig | null | undefined): string {
    const legacyContent = (config as { content?: string | string[] } | null | undefined)?.content;

    return [...this.normalizeToStringArray(config?.htmlContent), ...this.normalizeToStringArray(legacyContent)].join(
      '\n'
    );
  }

  private getContentUrls(config: RteInjectorConfig | null | undefined): string[] {
    const legacyContentUrls = (config as { contentURLs?: string | string[] } | null | undefined)?.contentURLs;
    return [...this.normalizeToStringArray(config?.htmlContentURLs), ...this.normalizeToStringArray(legacyContentUrls)];
  }

  private hasRenderableContentSource(config: RteInjectorConfig | null | undefined): boolean {
    return this.getStaticContent(config).length > 0 || this.getContentUrls(config).length > 0;
  }

  private getCssEntries(config: RteInjectorConfig | null | undefined): string[] {
    const legacyCss = (config as { css?: string | string[] } | null | undefined)?.css;
    const legacyStyles = (config as { styles?: string | string[] } | null | undefined)?.styles;

    const inlineStyles = [...this.normalizeToStringArray(config?.styles), ...this.normalizeToStringArray(legacyCss)];
    const cssUrls = [...this.normalizeToStringArray(config?.cssURLs), ...this.normalizeToStringArray(legacyStyles)];

    return [...cssUrls, ...inlineStyles];
  }

  private normalizeToStringArray(value: string | string[] | null | undefined): string[] {
    const values = Array.isArray(value) ? value : value ? [value] : [];
    return values.map((item) => item.trim()).filter((item) => item.length > 0);
  }

  private getContentCacheKey(urls: string[], localeAgnostic = false): string {
    return urls
      .map((url) => (localeAgnostic ? this.normalizeContentUrlForCache(url) : this.normalizeStylesheetUrl(url)))
      .join('|');
  }

  private logContentRequestCompletion(results: ContentFetchResult[], startedAt: number): void {
    const requestedUrls = results.map((entry) => entry.url);
    const succeeded = results.filter((entry) => entry.ok).length;
    const failed = results.length - succeeded;
    const tracking = this.getTrackingInfo(this.config());
    const detail: ContentRequestsFinishedDetail = {
      batchId: tracking.batchId,
      componentId: tracking.componentId,
      requested: results.length,
      succeeded,
      failed,
      durationMs: Math.max(0, Date.now() - startedAt),
      requestedUrls,
    };

    this.dispatchContentRequestsFinishedEvent(detail);
  }

  private getTrackingInfo(config: RteInjectorConfig | null | undefined): { batchId: string; componentId: string } {
    const maybeConfig = (config ?? null) as Record<string, unknown> | null;
    const batchId = String(maybeConfig?.['__rteRequestBatchId'] ?? '').trim() || 'unknown-batch';
    const componentId = String(maybeConfig?.['__rteRequestComponentId'] ?? '').trim() || 'unknown-component';
    return { batchId, componentId };
  }

  private dispatchContentRequestsFinishedEvent(detail: ContentRequestsFinishedDetail): void {
    this.document.dispatchEvent(
      new CustomEvent<ContentRequestsFinishedDetail>('rte-injector:content-requests-finished', {
        detail,
      })
    );
  }

  private async fetchContent(url: string, signal: AbortSignal): Promise<ContentFetchResult> {
    try {
      const response = await fetch(url, { signal });
      if (!response.ok) {
        console.warn(`[rte-injector] Unable to fetch content URL: ${url} (${response.status})`);
        return { url, content: '', ok: false };
      }

      return { url, content: await response.text(), ok: true };
    } catch {
      if (!signal.aborted) {
        console.warn(`[rte-injector] Unable to fetch content URL: ${url}`);
      }

      return { url, content: '', ok: false };
    }
  }

  private looksLikeStylesheetUrl(value: string): boolean {
    return value.startsWith('http://') || value.startsWith('https://') || value.startsWith('/');
  }

  private findExistingStylesheetLink(entry: string): boolean {
    const resolvedEntry = this.normalizeStylesheetUrl(entry);
    const links = this.document.head.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]');

    for (const link of Array.from(links)) {
      const href = link.getAttribute('href') ?? link.href;
      if (!href) {
        continue;
      }

      if (this.normalizeStylesheetUrl(href) === resolvedEntry) {
        return true;
      }
    }

    return false;
  }

  private findExistingStyleTag(entry: string): boolean {
    const normalizedEntry = entry.trim();
    const styleTags = this.document.head.querySelectorAll('style');

    for (const styleTag of Array.from(styleTags)) {
      if ((styleTag.textContent ?? '').trim() === normalizedEntry) {
        return true;
      }
    }

    return false;
  }

  private resolveUrl(value: string): string {
    try {
      return new URL(value, this.document.baseURI).href;
    } catch {
      return value;
    }
  }

  private normalizeContentUrlForCache(value: string): string {
    const resolved = this.resolveUrl(value);

    try {
      const parsed = new URL(resolved);
      parsed.hash = '';

      const segments = parsed.pathname.split('/');
      const lastSegmentIndex = segments.length - 1;
      const lastSegment = (segments[lastSegmentIndex] || '').toLowerCase();

      if (lastSegment === 'en' || lastSegment === 'es' || lastSegment === 'fr' || lastSegment === 'pt') {
        segments[lastSegmentIndex] = ':lang';
        parsed.pathname = segments.join('/');
      }

      return parsed.href;
    } catch {
      return resolved.replace(/\/(en|es|fr|pt)(?=\/?$)/i, '/:lang');
    }
  }

  private normalizeStylesheetUrl(value: string): string {
    const resolved = this.resolveUrl(value);

    try {
      const parsed = new URL(resolved);
      parsed.hash = '';
      return parsed.href;
    } catch {
      return resolved;
    }
  }
}
