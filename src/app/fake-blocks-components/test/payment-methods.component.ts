import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { BookingProgressService } from '../../services/booking-progress/booking-progress.service';

@Component({
  selector: 'pb-payment-methods',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container my-5">
      <h2 class="text-primary mb-4">Select Your Payment Method</h2>

      <div class="row g-4">
        @for (method of paymentMethods; track method.label) {
          <div class="col-12">
            <button
              class="btn w-100 py-3 d-flex align-items-center justify-content-between shadow-sm"
              [ngClass]="method.class"
              (click)="toggleSelected(method.label)">
              <img width="50" src="{{method.icon}}"><span class="fs-4">{{ method.label }}</span>
              <span class="badge" [ngClass]="selected === method.label ? 'bg-primary' : 'bg-light text-dark'">
                {{ selected === method.label ? 'Selected' : 'Select' }}
              </span>
            </button>

            <div *ngIf="selected === method.label" class="mt-3 border rounded p-4 bg-light shadow-sm">
              <h5 class="mb-3">Enter your {{ method.label }} details</h5>

              <form>
                <div class="mb-3" *ngIf="method.label !== 'PayPal' && method.label !== 'Apple Pay'">
                  <label class="form-label">Cardholder Name</label>
                  <input type="text" class="form-control" placeholder="John Doe">
                </div>

                <div class="mb-3" *ngIf="method.label !== 'PayPal' && method.label !== 'Apple Pay'">
                  <label class="form-label">Card Number</label>
                  <input type="text" class="form-control" placeholder="1234 5678 9012 3456">
                </div>

                <div class="row" *ngIf="method.label !== 'PayPal' && method.label !== 'Apple Pay'">
                  <div class="col-md-6 mb-3">
                    <label class="form-label">Expiry Date</label>
                    <input type="text" class="form-control" placeholder="MM/YY">
                  </div>
                  <div class="col-md-6 mb-3">
                    <label class="form-label">CVV</label>
                    <input type="text" class="form-control" placeholder="123">
                  </div>
                </div>

                <div *ngIf="method.label === 'PayPal' || method.label === 'Apple Pay'">
                  <p class="text-muted">You will be redirected to {{ method.label }} to complete your payment.</p>
                </div>

                <button type="button" (click)="goToResults()" class="btn btn-success w-100 mt-2">Fake Pay</button>
              </form>
            </div>
          </div>
        }
      </div>

      <div class="mt-5 text-center">
        <p class="text-muted small">This is a simulated payment interface. No real transactions are processed.</p>
      </div>
    </div>
  `
})
export class PaymentMethodsComponent {
  private progress = inject(BookingProgressService);
  private router = inject(Router);
  private getPaymentIconUrl = (method: string) => `https://upload.wikimedia.org/wikipedia/commons/${method}`;

  public selected: string | null = null;
  public paymentMethods = [
    {
      label: 'Visa',
      icon: this.getPaymentIconUrl('4/41/Visa_Logo.png'),
      class: 'btn-outline-primary'
    },
    {
      label: 'MasterCard',
      icon: this.getPaymentIconUrl('0/04/Mastercard-logo.png'),
      class: 'btn-outline-danger'
    },
    {
      label: 'PayPal',
      icon: this.getPaymentIconUrl('a/a4/Paypal_2014_logo.png'),
      class: 'btn-outline-info'
    },
    {
      label: 'Apple Pay',
      icon: this.getPaymentIconUrl('b/b0/Apple_Pay_logo.svg'),
      class: 'btn-outline-dark'
    },
    {
      label: 'American Express',
      icon: this.getPaymentIconUrl('f/fa/American_Express_logo_%282018%29.svg'),
      class: 'btn-outline-success'
    }
  ];

  public toggleSelected(label: string): void {
    this.selected = this.selected === label ? null : label;
  }

  public goToResults(): void {
    // this.progress.completeStep('payment');
    // this.router.navigate(['payment-success']);
    this.progress.markBookingProcessAsCompleted('payment', 'payment-success');
  }
}
