import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

type LoyaltyTone = 'red' | 'gold' | 'silver' | 'blue';

@Component({
  selector: 'loyalty-overview-card',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './loyalty-card.component.html',
  styleUrl: './loyalty-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoyaltyOverviewCardComponent {
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
  private readonly loyaltyTone = signal<LoyaltyTone>('red');

  constructor() {
    effect((onCleanup) => {
      const url = String(this.config()?.url || '').trim();

      if (!url) {
        this.loyaltyTone.set('red');
        return;
      }

      const subscription = this.http.get<unknown>(url).subscribe({
        next: (response) => {
          this.loyaltyTone.set(this.resolveTone(response));
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
}
