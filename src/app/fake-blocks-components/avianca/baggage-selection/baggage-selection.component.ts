import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Output } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'baggage-selection',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './baggage-selection.component.html',
  styleUrl: './baggage-selection.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BaggageSelectionComponent {
  @Output() public close = new EventEmitter<void>();

  public legs = ['MAD - AUC', 'AUC - MAD'];
  public activeLeg = this.legs[0];

  public options = [
    {
      id: 'bag-cabin',
      title: 'BAGGAGE_SELECTION.OPTIONS.CABIN.TITLE',
      sub: 'BAGGAGE_SELECTION.OPTIONS.CABIN.SUB',
      priceLabel: 'BAGGAGE_SELECTION.PRICE_FIRST',
      priceValue: 39.9,
      badge: 'BAGGAGE_SELECTION.BADGE_BEST_PRICE',
      imageUrl: 'assets/illustrations/extras/baggage-cabin.svg',
      quantity: 0,
    },
    {
      id: 'bag-checked',
      title: 'BAGGAGE_SELECTION.OPTIONS.CHECKED.TITLE',
      sub: 'BAGGAGE_SELECTION.OPTIONS.CHECKED.SUB',
      priceLabel: 'BAGGAGE_SELECTION.PRICE_FIRST',
      priceValue: 101.64,
      imageUrl: 'assets/illustrations/extras/baggage-checked.svg',
      quantity: 0,
    },
    {
      id: 'bag-extra',
      title: 'BAGGAGE_SELECTION.OPTIONS.EXTRA.TITLE',
      sub: 'BAGGAGE_SELECTION.OPTIONS.EXTRA.SUB',
      priceLabel: 'BAGGAGE_SELECTION.PRICE_PER',
      priceValue: 149.9,
      imageUrl: 'assets/illustrations/extras/baggage-extra.svg',
      quantity: 0,
    },
  ];

  public setLeg(leg: string): void {
    this.activeLeg = leg;
  }

  public increment(optionId: string): void {
    const option = this.options.find((item) => item.id === optionId);
    if (option) {
      option.quantity += 1;
    }
  }

  public decrement(optionId: string): void {
    const option = this.options.find((item) => item.id === optionId);
    if (option) {
      option.quantity = Math.max(0, option.quantity - 1);
    }
  }

  public formatPrice(value: number): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
    }).format(value);
  }

  public totalFor(optionId: string): string {
    const option = this.options.find((item) => item.id === optionId);
    if (!option) {
      return this.formatPrice(0);
    }

    return this.formatPrice(option.quantity * option.priceValue);
  }
}
