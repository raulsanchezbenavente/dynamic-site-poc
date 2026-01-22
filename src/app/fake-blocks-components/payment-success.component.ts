import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { BookingProgressService } from '../services/booking-progress/booking-progress.service';

@Component({
  selector: 'pb-payment-success',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container my-5 text-center">
      <div class="p-5 bg-light rounded shadow-sm border">
        <div class="mb-4">
          <span class="display-1 text-success">✔️</span>
        </div>
        <h2 class="text-success mb-3">Booking Confirmed!</h2>
        <p class="lead mb-4">
          Thank you for your purchase. Your flight has been successfully booked.
        </p>
        <p class="text-muted mb-4">
          A confirmation email with your itinerary and ticket details has been sent to your inbox.
        </p>
        <a class="btn btn-primary btn-lg" (click)="goToHome()">Back to Home</a>
      </div>
    </div>
  `
})
export class PaymentSuccessComponent {
  private progress = inject(BookingProgressService);
  private router = inject(Router);

  public ngOnInit(): void {
    // this.progress.resetProgress();
    localStorage.removeItem('BOOKING_PROCESS');
    this.progress.markBookingProcessAsCompleted('payment-success');
  }

  public goToHome() {
    this.router.navigate(['home']);
  }
}
