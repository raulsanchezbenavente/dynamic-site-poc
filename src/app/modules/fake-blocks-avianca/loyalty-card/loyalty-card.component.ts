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
import { DynamicPageReadinessBase, DynamicPageReadyState } from '@dynamic-composite';
import { AppLang, RouterHelperService, SiteConfigService } from '@navigation';
import { TranslateModule } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';

import { SessionApiService } from '../account-profile/services/session-api.service';
import { LoyaltyTone, LoyaltyToneService } from '../loyalty-tone.service';

import { LoyaltyCardConfig } from './models/loyalty-card-config.model';

@Component({
  selector: 'loyalty-overview-card',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './loyalty-card.component.html',
  styleUrl: './loyalty-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoyaltyOverviewCardComponent extends DynamicPageReadinessBase implements OnInit, OnDestroy {
  public colorConfig = input<LoyaltyCardConfig | null>(null);
  public name = input<string>('Perico');

  public memberNumber = input<string>('13440242314');
  public totalMiles = input<string>('600,700');
  public expirationDate = input<string>('31 de mayo de 2026');
  public displayName = computed(() => this.sessionName() || this.name());
  public displayMemberNumber = computed(() => this.sessionMemberNumber() || this.memberNumber());
  public displayTotalMiles = computed(() => this.sessionTotalMiles() || this.totalMiles());
  public displayExpirationDate = computed(() => this.sessionExpirationDate() || this.expirationDate());
  public accentColor = computed(() => this.getToneColor(this.loyaltyTone()));
  public gradientStartColor = computed(() => this.getGradientStops(this.loyaltyTone()).start);
  public gradientEndColor = computed(() => this.getGradientStops(this.loyaltyTone()).end);

  private readonly http = inject(HttpClient);
  private readonly routerHelper = inject(RouterHelperService);
  private readonly sessionApi = inject(SessionApiService);
  private readonly siteConfig = inject(SiteConfigService);
  private readonly loyaltyToneSvc = inject(LoyaltyToneService);
  private readonly loyaltyTone = signal<LoyaltyTone | null>(this.loyaltyToneSvc.tone());
  private readonly activeLang = signal<AppLang>(this.routerHelper.language);
  private readonly sessionName = signal('');
  private readonly sessionMemberNumber = signal('');
  private readonly sessionTotalMiles = signal('');
  private readonly sessionExpirationDate = signal('');
  private readonly destroy$ = new Subject<void>();

  public ngOnInit(): void {
    this.routerHelper.languageChange$.pipe(takeUntil(this.destroy$)).subscribe((lang: AppLang) => {
      this.activeLang.set(lang);
    });

    void this.loadSessionData();
  }

  public ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  constructor() {
    super();
    effect((onCleanup) => {
      const lang = this.activeLang();
      const pageId = String(this.routerHelper.getCurrentPageId() ?? '');
      const blockConfig = pageId ? this.siteConfig.getBlockConfig(pageId, 'loyaltyOverviewCard_uiplus_EX', lang) : null;
      const siteUrl = typeof blockConfig?.['url'] === 'string' ? blockConfig['url'] : '';
      const url = (siteUrl || this.colorConfig()?.url || '').trim();

      if (!url) {
        // Keep the previous tone if URL is temporarily unavailable while language/config settles.
        this.emitDynamicPageReady(this.colorConfig(), 'rteBlock_uiplus', DynamicPageReadyState.RENDERED);
        return;
      }

      const subscription = this.http.get(url, { responseType: 'text' }).subscribe({
        next: (responseText) => {
          const tone = this.resolveTone(this.parseLoyaltyPayload(responseText));
          // Only replace tone when payload provides a valid one; this avoids momentary color flicker.
          if (tone) {
            this.loyaltyTone.set(tone);
            this.loyaltyToneSvc.tone.set(tone);
          }

          this.emitDynamicPageReady(this.colorConfig(), 'rteBlock_uiplus', DynamicPageReadyState.LOADED);
        },
        error: () => {
          // Keep previous tone on transient request errors.
          this.emitDynamicPageReady(this.colorConfig(), 'rteBlock_uiplus', DynamicPageReadyState.ERROR);
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

  private async loadSessionData(): Promise<void> {
    const data = await this.sessionApi.getSessionData();
    if (!data) {
      return;
    }

    const fullName = this.sessionApi.formatPersonName([data.firstName, data.middleName, data.lastName]);
    const milesAmount = Number(data.balance?.lifemiles?.amount || 0);

    this.sessionName.set(fullName);
    this.sessionMemberNumber.set(String(data.customerNumber || '').trim());
    this.sessionTotalMiles.set(new Intl.NumberFormat('es-CO').format(milesAmount));
    this.sessionExpirationDate.set(this.formatSessionDate(data.balance?.lastUpdate));
  }

  private formatSessionDate(value: string | undefined): string {
    const trimmed = String(value || '').trim();
    if (!trimmed) {
      return '';
    }

    const date = new Date(trimmed);
    if (Number.isNaN(date.getTime())) {
      return '';
    }

    return new Intl.DateTimeFormat('es-CO', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }).format(date);
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

  private getToneColor(tone: LoyaltyTone | null): string {
    if (!tone) {
      return 'transparent';
    }

    if (tone === 'red') {
      return '#e2007a';
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

    return 'transparent';
  }

  private getGradientStops(tone: LoyaltyTone | null): { start: string; end: string } {
    if (!tone) {
      return { start: 'transparent', end: 'transparent' };
    }

    if (tone === 'red') {
      return { start: '#b50080', end: '#ff0000' };
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

    return { start: 'transparent', end: 'transparent' };
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
