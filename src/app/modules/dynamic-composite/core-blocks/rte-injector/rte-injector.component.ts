import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';

import { RteInjectorConfig } from './models/rte-injector-config.model';

@Component({
  selector: 'rte-injector',
  standalone: true,
  templateUrl: './rte-injector.component.html',
  styleUrl: './rte-injector.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RteInjectorComponent {
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
      this.fetchedContent.set('');

      if (urls.length === 0) {
        return;
      }

      const controller = new AbortController();
      let isDisposed = false;

      void (async (): Promise<void> => {
        const contents = await Promise.all(urls.map(async (url) => this.fetchContent(url, controller.signal)));
        if (isDisposed) {
          return;
        }

        const mergedContent = contents.filter((entry) => entry.length > 0).join('\n');
        this.fetchedContent.set(mergedContent);
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

      const createdNodes: Array<HTMLLinkElement | HTMLStyleElement> = [];

      for (const entry of entries) {
        if (this.looksLikeStylesheetUrl(entry)) {
          if (this.findExistingStylesheetLink(entry)) {
            continue;
          }

          const link = this.document.createElement('link');
          link.rel = 'stylesheet';
          link.href = entry;
          link.setAttribute('data-rte-injector', 'true');
          this.document.head.appendChild(link);
          createdNodes.push(link);
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
        createdNodes.push(style);
      }

      onCleanup(() => {
        for (const node of createdNodes) {
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

  private async fetchContent(url: string, signal: AbortSignal): Promise<string> {
    try {
      const response = await fetch(url, { signal });
      if (!response.ok) {
        console.warn(`[rte-injector] Unable to fetch content URL: ${url} (${response.status})`);
        return '';
      }

      return await response.text();
    } catch {
      if (!signal.aborted) {
        console.warn(`[rte-injector] Unable to fetch content URL: ${url}`);
      }

      return '';
    }
  }

  private looksLikeStylesheetUrl(value: string): boolean {
    return value.startsWith('http://') || value.startsWith('https://') || value.startsWith('/');
  }

  private findExistingStylesheetLink(entry: string): boolean {
    const resolvedEntry = this.resolveUrl(entry);
    const links = this.document.head.querySelectorAll('link[rel="stylesheet"]');

    for (const link of Array.from(links)) {
      const href = link.getAttribute('href') ?? '';
      if (!href) {
        continue;
      }

      if (this.resolveUrl(href) === resolvedEntry) {
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
}
