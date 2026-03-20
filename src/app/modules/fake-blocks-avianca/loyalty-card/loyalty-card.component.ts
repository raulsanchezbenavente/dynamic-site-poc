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

type LoyaltyTone = 'red' | 'gold' | 'silver' | 'blue';

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
  public gradientBackground = computed(() => {
    const tone = this.loyaltyTone();
    if (tone === 'gold') {
      return 'linear-gradient(180deg, #8a5a00, #d4a52a)';
    }

    if (tone === 'blue') {
      return 'linear-gradient(180deg, #0b4ea2, #2e86ff)';
    }

    if (tone === 'silver') {
      return 'linear-gradient(180deg, #66778a, #aeb8c2)';
    }

    return 'linear-gradient(180deg, #b50080, red)';
  });

  private readonly http = inject(HttpClient);
  private readonly routerHelper = inject(RouterHelperService);
  private readonly siteConfig = inject(SiteConfigService);
  private readonly loyaltyTone = signal<LoyaltyTone>('red');
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
      const url = String(blockConfig?.url ?? this.config()?.url ?? '').trim();

      if (!url) {
        this.loyaltyTone.set('red');
        return;
      }

      const subscription = this.http.get(url, { responseType: 'text' }).subscribe({
        next: (responseText) => {
          this.loyaltyTone.set(this.resolveTone(this.parseLoyaltyPayload(responseText)));
        },
        error: () => {
          this.loyaltyTone.set('red');
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

  private resolveTone(payload: unknown): LoyaltyTone {
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

    return 'red';
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
