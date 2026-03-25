import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, inject, input } from '@angular/core';

interface RteInjectorConfig {
  content?: string;
  css?: string[];
  styles?: string[];
}

@Component({
  selector: 'rte-injector',
  standalone: true,
  templateUrl: './rte-injector.component.html',
  styleUrl: './rte-injector.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RteInjectorComponent {
  private readonly document = inject(DOCUMENT);
  public readonly config = input<RteInjectorConfig | null | undefined>(undefined);

  public readonly htmlContent = computed(() => this.config()?.content ?? '');

  constructor() {
    effect((onCleanup) => {
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

  private getCssEntries(config: RteInjectorConfig | null | undefined): string[] {
    const values = [...(config?.css ?? []), ...(config?.styles ?? [])];
    return values.map((item) => item.trim()).filter((item) => item.length > 0);
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
