import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { AppLang, RouterHelperService, SiteConfigService } from '@navigation';
import { TranslateModule } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';

import { LoyaltyTone, LoyaltyToneService } from '../loyalty-tone.service';

@Component({
  selector: 'loyalty-overview-card',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './loyalty-card.component.html',
  styleUrl: './loyalty-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoyaltyOverviewCardComponent implements OnInit, OnDestroy {
  public config = input<{ url?: string } | null>(null);
  public name = input<string>('Perico');

  public memberNumber = input<string>('13440242314');
  public totalMiles = input<string>('600,700');
  public expirationDate = input<string>('31 de mayo de 2026');
  public accentColor = computed(() => this.getToneColor(this.loyaltyTone()));
  public gradientStartColor = computed(() => this.getGradientStops(this.loyaltyTone()).start);
  public gradientEndColor = computed(() => this.getGradientStops(this.loyaltyTone()).end);

  private readonly http = inject(HttpClient);
  private readonly routerHelper = inject(RouterHelperService);
  private readonly siteConfig = inject(SiteConfigService);
  private readonly loyaltyToneSvc = inject(LoyaltyToneService);
  private readonly loyaltyTone = signal<LoyaltyTone | null>(null);
  private readonly activeLang = signal<AppLang>(this.routerHelper.language);
  private readonly destroy$ = new Subject<void>();

  public ngOnInit(): void {
    this.routerHelper.languageChange$.pipe(takeUntil(this.destroy$)).subscribe((lang: AppLang) => {
      this.activeLang.set(lang);
    });
  }

  public ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  constructor() {
    effect((onCleanup) => {
      const lang = this.activeLang();
      const pageId = String(this.routerHelper.getCurrentPageId() ?? '');
      const blockConfig = pageId ? this.siteConfig.getBlockConfig(pageId, 'loyaltyOverviewCard_uiplus', lang) : null;
      const url = String(blockConfig?.['url'] ?? this.config()?.url ?? '').trim();

      if (!url) {
        this.loyaltyTone.set(null);
        this.loyaltyToneSvc.tone.set(null);
        return;
      }

      const subscription = this.http.get(url, { responseType: 'text' }).subscribe({
        next: (responseText) => {
          const tone = this.resolveTone(this.parseLoyaltyPayload(responseText));
          this.loyaltyTone.set(tone);
          this.loyaltyToneSvc.tone.set(tone);
        },
        error: () => {
          this.loyaltyTone.set(null);
          this.loyaltyToneSvc.tone.set(null);
        },
      });

      onCleanup(() => subscription.unsubscribe());
    });
  }

  public async copy(text: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Silencioso; si quieres, aquí puedes emitir un toast/evento
    }
  }

  private resolveTone(payload: unknown): LoyaltyTone | null {
    const normalizedFromPayload = this.normalizeTone(payload);
    if (normalizedFromPayload) {
      return normalizedFromPayload;
    }

    if (payload && typeof payload === 'object') {
      const stack: unknown[] = [payload];
      const visited = new Set<unknown>();

      while (stack.length > 0) {
        const current = stack.pop();
        if (!current || typeof current !== 'object' || visited.has(current)) {
          continue;
        }

        visited.add(current);
        for (const value of Object.values(current)) {
          const normalized = this.normalizeTone(value);
          if (normalized) {
            return normalized;
          }

          if (value && typeof value === 'object') {
            stack.push(value);
          }
        }
      }
    }

    return null;
  }

  private getToneColor(tone: LoyaltyTone | null): string | null {
    if (!tone) {
      return null;
    }

    if (tone === 'gold') {
      return '#d4a52a';
    }

    if (tone === 'silver') {
      return '#7a8fa6';
    }

    if (tone === 'blue') {
      return '#2e86ff';
    }

    return '#e2007a';
  }

  private getGradientStops(tone: LoyaltyTone | null): { start: string | null; end: string | null } {
    if (!tone) {
      return { start: null, end: null };
    }

    if (tone === 'gold') {
      return { start: '#8a5a00', end: '#d4a52a' };
    }

    if (tone === 'silver') {
      return { start: '#66778a', end: '#aeb8c2' };
    }

    if (tone === 'blue') {
      return { start: '#0b4ea2', end: '#2e86ff' };
    }

    return { start: '#b50080', end: '#ff0000' };
  }

  private normalizeTone(value: unknown): LoyaltyTone | null {
    if (typeof value !== 'string') {
      return null;
    }

    const normalized = value.trim().toLowerCase();
    if (normalized === 'gold') {
      return 'gold';
    }

    if (normalized === 'silver') {
      return 'silver';
    }

    if (normalized === 'blue') {
      return 'blue';
    }

    if (normalized === 'red') {
      return 'red';
    }

    return null;
  }

  private parseLoyaltyPayload(raw: string): unknown {
    const trimmed = String(raw || '').trim();
    if (!trimmed) {
      return null;
    }
    try {
      return JSON.parse(trimmed);
    } catch {
      return trimmed;
    }
  }
}
