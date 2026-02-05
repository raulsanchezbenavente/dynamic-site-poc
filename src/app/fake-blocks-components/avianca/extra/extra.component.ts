import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

type ExtraCard = {
  titleKey: string;
  descriptionKey: string;
  price?: string;
  priceKey?: string;
  priceLabelKey: string;
  imageUrl: string;
  imageAltKey: string;
};

@Component({
  selector: 'extra',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './extra.component.html',
  styleUrl: './extra.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExtraComponent {
  public extras: ExtraCard[] = [
    {
      titleKey: 'EXTRAS.CARDS.SEAT.TITLE',
      descriptionKey: 'EXTRAS.CARDS.SEAT.DESC',
      priceKey: 'EXTRAS.PRICE_FREE',
      priceLabelKey: 'EXTRAS.PRICE_FROM',
      imageUrl: 'assets/illustrations/extras/seat.svg',
      imageAltKey: 'EXTRAS.CARDS.SEAT.ALT',
    },
    {
      titleKey: 'EXTRAS.CARDS.BAGGAGE.TITLE',
      descriptionKey: 'EXTRAS.CARDS.BAGGAGE.DESC',
      price: '€ 101,64',
      priceLabelKey: 'EXTRAS.PRICE_FROM',
      imageUrl: 'assets/illustrations/extras/baggage.svg',
      imageAltKey: 'EXTRAS.CARDS.BAGGAGE.ALT',
    },
    {
      titleKey: 'EXTRAS.CARDS.LOUNGE.TITLE',
      descriptionKey: 'EXTRAS.CARDS.LOUNGE.DESC',
      price: '€ 31,57',
      priceLabelKey: 'EXTRAS.PRICE_FROM',
      imageUrl: 'assets/illustrations/extras/lounge.svg',
      imageAltKey: 'EXTRAS.CARDS.LOUNGE.ALT',
    },
    {
      titleKey: 'EXTRAS.CARDS.SPORTS.TITLE',
      descriptionKey: 'EXTRAS.CARDS.SPORTS.DESC',
      price: '€ 110,10',
      priceLabelKey: 'EXTRAS.PRICE_FROM',
      imageUrl: 'assets/illustrations/extras/sports.svg',
      imageAltKey: 'EXTRAS.CARDS.SPORTS.ALT',
    },
    {
      titleKey: 'EXTRAS.CARDS.ASSIST.TITLE',
      descriptionKey: 'EXTRAS.CARDS.ASSIST.DESC',
      price: '€ 18,90',
      priceLabelKey: 'EXTRAS.PRICE_FROM',
      imageUrl: 'assets/illustrations/extras/assist.svg',
      imageAltKey: 'EXTRAS.CARDS.ASSIST.ALT',
    },
    {
      titleKey: 'EXTRAS.CARDS.PRIORITY.TITLE',
      descriptionKey: 'EXTRAS.CARDS.PRIORITY.DESC',
      price: '€ 14,50',
      priceLabelKey: 'EXTRAS.PRICE_FROM',
      imageUrl: 'assets/illustrations/extras/priority.svg',
      imageAltKey: 'EXTRAS.CARDS.PRIORITY.ALT',
    },
  ];
}
