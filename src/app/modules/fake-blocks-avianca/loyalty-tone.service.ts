import { computed, Injectable, signal } from '@angular/core';

export type LoyaltyTone = 'red' | 'gold' | 'silver' | 'blue';

const TONE_COLORS: Record<LoyaltyTone, string> = {
  red: '#e2007a',
  gold: '#d4a52a',
  silver: '#7a8fa6',
  blue: '#2e86ff',
};

@Injectable({ providedIn: 'root' })
export class LoyaltyToneService {
  public readonly tone = signal<LoyaltyTone | null>(null);
  public readonly color = computed(() => {
    const tone = this.tone();
    return tone ? TONE_COLORS[tone] : null;
  });
}
