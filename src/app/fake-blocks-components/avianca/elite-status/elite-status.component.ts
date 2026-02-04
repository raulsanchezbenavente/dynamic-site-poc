import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

type Benefit = {
  label: string;
};

@Component({
  selector: 'elite-status',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './elite-status.component.html',
  styleUrl: './elite-status.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EliteStatusComponent {
  public title = input<string>('ELITE_STATUS.TITLE');
  public tierLabel = input<string>('ELITE_STATUS.CURRENT_TIER');
  public tierName = input<string>('Gold');
  public milesToNextLabel = input<string>('ELITE_STATUS.MILES_TO_NEXT');
  public milesToNext = input<string>('12,000');
  public nextTierLabel = input<string>('ELITE_STATUS.NEXT_TIER');
  public nextTier = input<string>('Platinum');
  public expirationLabel = input<string>('ELITE_STATUS.EXPIRATION');
  public expirationDate = input<string>('31 Dec 2026');
  public progress = input<number>(72);
  public ctaLabel = input<string>('ELITE_STATUS.CTA_VIEW');

  public benefitsTitle = input<string>('ELITE_STATUS.BENEFITS');
  public benefits = input<Benefit[]>([
    { label: 'ELITE_STATUS.BENEFIT_PRIORITY' },
    { label: 'ELITE_STATUS.BENEFIT_UPGRADES' },
    { label: 'ELITE_STATUS.BENEFIT_BONUS' },
  ]);

  public trackByLabel(_: number, item: Benefit): string {
    return item.label;
  }
}
