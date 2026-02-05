import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

type PaymentMethod = {
  id: 'card' | 'paypal' | 'applepay';
  label: string;
  logos?: string[];
};

@Component({
  selector: 'payment',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './payment.component.html',
  styleUrl: './payment.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentComponent {
  public methods: PaymentMethod[] = [
    {
      id: 'card',
      label: 'Tarjeta de crédito y débito',
      logos: ['VISA', 'MC', 'AMEX'],
    },
    {
      id: 'paypal',
      label: 'PayPal',
    },
    {
      id: 'applepay',
      label: 'Apple Pay',
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
