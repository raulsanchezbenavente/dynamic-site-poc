import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { RouterHelperService } from '../../../services/router-helper/router-helper.service';
import { AppLang } from '../../../services/site-config/models/langs.model';
import { SiteConfigService } from '../../../services/site-config/site-config.service';

type PaymentMethod = {
  id: 'card' | 'paypal' | 'applepay';
  label: string;
  logos?: string[];
};

@Component({
  selector: 'payment',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './payment.component.html',
  styleUrl: './payment.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentComponent {
  private router = inject(Router);
  private routerHelper = inject(RouterHelperService);
  private siteConfig = inject(SiteConfigService);
  public methods: PaymentMethod[] = [
    {
      id: 'card',
      label: 'PAYMENT.METHOD_CARD',
      logos: ['VISA', 'MC', 'AMEX'],
    },
    {
      id: 'paypal',
      label: 'PAYMENT.METHOD_PAYPAL',
    },
    {
      id: 'applepay',
      label: 'PAYMENT.METHOD_APPLEPAY',
    },
  ];

  public activeMethod: PaymentMethod['id'] = 'card';
  public splitPayment = false;

  public setMethod(methodId: PaymentMethod['id']): void {
    this.activeMethod = methodId;
  }

  public toggleSplit(): void {
    this.splitPayment = !this.splitPayment;
  }

  public goToThanks(): void {
    const lang = this.routerHelper.language as AppLang;
    const path = this.siteConfig.getPathByPageId('1-4', lang);
    this.router.navigateByUrl(path ?? `/${lang}/thanks`);
  }
}
