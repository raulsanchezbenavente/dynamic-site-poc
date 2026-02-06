import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { RouterHelperService } from '../../../services/router-helper/router-helper.service';
import { AppLang } from '../../../services/site-config/models/langs.model';
import { SiteConfigService } from '../../../services/site-config/site-config.service';
import { BaggageSelectionComponent } from '../baggage-selection/baggage-selection.component';
import { LoungeSelectionComponent } from '../lounge-selection/lounge-selection.component';
import { SeatSelectionComponent } from '../seat-selection/seat-selection.component';

type ExtraCard = {
  id: 'seat' | 'baggage' | 'lounge' | 'sports' | 'assist' | 'priority';
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
  imports: [CommonModule, TranslateModule, SeatSelectionComponent, BaggageSelectionComponent, LoungeSelectionComponent],
  templateUrl: './extra.component.html',
  styleUrl: './extra.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExtraComponent implements OnDestroy {
  private router = inject(Router);
  private routerHelper = inject(RouterHelperService);
  private siteConfig = inject(SiteConfigService);

  public activeModal: 'seat' | 'baggage' | 'lounge' | null = null;

  public extras: ExtraCard[] = [
    {
      id: 'seat',
      titleKey: 'EXTRAS.CARDS.SEAT.TITLE',
      descriptionKey: 'EXTRAS.CARDS.SEAT.DESC',
      priceKey: 'EXTRAS.PRICE_FREE',
      priceLabelKey: 'EXTRAS.PRICE_FROM',
      imageUrl: 'assets/illustrations/extras/seat.svg',
      imageAltKey: 'EXTRAS.CARDS.SEAT.ALT',
    },
    {
      id: 'baggage',
      titleKey: 'EXTRAS.CARDS.BAGGAGE.TITLE',
      descriptionKey: 'EXTRAS.CARDS.BAGGAGE.DESC',
      price: '€ 101,64',
      priceLabelKey: 'EXTRAS.PRICE_FROM',
      imageUrl: 'assets/illustrations/extras/baggage.svg',
      imageAltKey: 'EXTRAS.CARDS.BAGGAGE.ALT',
    },
    {
      id: 'lounge',
      titleKey: 'EXTRAS.CARDS.LOUNGE.TITLE',
      descriptionKey: 'EXTRAS.CARDS.LOUNGE.DESC',
      price: '€ 31,57',
      priceLabelKey: 'EXTRAS.PRICE_FROM',
      imageUrl: 'assets/illustrations/extras/lounge.svg',
      imageAltKey: 'EXTRAS.CARDS.LOUNGE.ALT',
    },
    {
      id: 'sports',
      titleKey: 'EXTRAS.CARDS.SPORTS.TITLE',
      descriptionKey: 'EXTRAS.CARDS.SPORTS.DESC',
      price: '€ 110,10',
      priceLabelKey: 'EXTRAS.PRICE_FROM',
      imageUrl: 'assets/illustrations/extras/sports.svg',
      imageAltKey: 'EXTRAS.CARDS.SPORTS.ALT',
    },
    {
      id: 'assist',
      titleKey: 'EXTRAS.CARDS.ASSIST.TITLE',
      descriptionKey: 'EXTRAS.CARDS.ASSIST.DESC',
      price: '€ 18,90',
      priceLabelKey: 'EXTRAS.PRICE_FROM',
      imageUrl: 'assets/illustrations/extras/assist.svg',
      imageAltKey: 'EXTRAS.CARDS.ASSIST.ALT',
    },
    {
      id: 'priority',
      titleKey: 'EXTRAS.CARDS.PRIORITY.TITLE',
      descriptionKey: 'EXTRAS.CARDS.PRIORITY.DESC',
      price: '€ 14,50',
      priceLabelKey: 'EXTRAS.PRICE_FROM',
      imageUrl: 'assets/illustrations/extras/priority.svg',
      imageAltKey: 'EXTRAS.CARDS.PRIORITY.ALT',
    },
  ];

  public openModal(cardId: ExtraCard['id']): void {
    if (cardId === 'seat' || cardId === 'baggage' || cardId === 'lounge') {
      this.activeModal = cardId;
      this.setBodyScrollLocked(true);
    }
  }

  public closeModal(): void {
    this.activeModal = null;
    this.setBodyScrollLocked(false);
  }

  public ngOnDestroy(): void {
    this.setBodyScrollLocked(false);
  }

  private setBodyScrollLocked(locked: boolean): void {
    const body = globalThis.document?.body;
    if (!body) return;
    body.style.overflow = locked ? 'hidden' : '';
    body.style.touchAction = locked ? 'none' : '';
  }

  public goToPayment(): void {
    const lang = this.routerHelper.language as AppLang;
    const path = this.siteConfig.getPathByPageId('1-3', lang);
    this.router.navigateByUrl(path ?? `/${lang}/payment`);
  }
}
