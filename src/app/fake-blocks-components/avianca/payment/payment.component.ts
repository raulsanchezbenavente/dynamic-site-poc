import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

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
}
