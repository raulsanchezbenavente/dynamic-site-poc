import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, HostListener, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { RouterHelperService } from '../../../services/router-helper/router-helper.service';
import { AppLang } from '../../../services/site-config/models/langs.model';
import { SiteConfigService } from '../../../services/site-config/site-config.service';

type PaymentMethod = {
  id: 'card' | 'paypal' | 'applepay' | 'gpay';
  label: string;
  descriptionKey: string;
  logos?: string[];
};

@Component({
  selector: 'payment',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './payment.component.html',
  styleUrl: './payment.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentComponent {
  private router = inject(Router);
  private routerHelper = inject(RouterHelperService);
  private siteConfig = inject(SiteConfigService);
  private lastTap = 0;
  public methods: PaymentMethod[] = [
    {
      id: 'card',
      label: 'PAYMENT.METHOD_CARD',
      descriptionKey: 'PAYMENT.METHOD_CARD_DESC',
      logos: ['VISA', 'MC', 'AMEX'],
    },
    {
      id: 'paypal',
      label: 'PAYMENT.METHOD_PAYPAL',
      descriptionKey: 'PAYMENT.METHOD_PAYPAL_DESC',
    },
    {
      id: 'applepay',
      label: 'PAYMENT.METHOD_APPLEPAY',
      descriptionKey: 'PAYMENT.METHOD_APPLEPAY_DESC',
    },
    {
      id: 'gpay',
      label: 'PAYMENT.METHOD_GPAY',
      descriptionKey: 'PAYMENT.METHOD_GPAY_DESC',
    },
  ];

  public activeMethod: PaymentMethod['id'] = 'card';
  public splitPayment = false;
  public cardNumber = '';
  public cardExpiry = '';
  public cardCvv = '';

  @HostListener('document:dblclick')
  public onDocumentDoubleClick(): void {
    this.fillDemoData();
  }

  @HostListener('document:touchend', ['$event'])
  public onDocumentTouchEnd(event: TouchEvent): void {
    const now = Date.now();
    if (now - this.lastTap < 300) {
      event.preventDefault();
      this.fillDemoData();
    }
    this.lastTap = now;
  }

  public setMethod(methodId: PaymentMethod['id']): void {
    this.activeMethod = methodId;
  }

  public toggleSplit(): void {
    this.splitPayment = !this.splitPayment;
  }

  public fillDemoData(): void {
    this.activeMethod = 'card';
    this.cardNumber = '4111 1111 1111 1111';
    this.cardExpiry = '10/28';
    this.cardCvv = '123';
  }

  public isCardFormValid(): boolean {
    return this.hasValue(this.cardNumber) && this.hasValue(this.cardExpiry) && this.hasValue(this.cardCvv);
  }

  private hasValue(value: string): boolean {
    return value.trim().length > 0;
  }

  public goToThanks(): void {
    const lang = this.routerHelper.language as AppLang;
    const path = this.siteConfig.getPathByPageId('1-4', lang);
    this.router.navigateByUrl(path ?? `/${lang}/thanks`);
  }
}
