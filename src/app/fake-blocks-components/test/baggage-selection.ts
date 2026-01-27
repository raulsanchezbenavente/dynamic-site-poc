import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { BookingProgressService } from '../../services/booking-progress/booking-progress.service';

@Component({
  selector: 'pb-baggage-selection',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container my-5">
      <h2 class="text-center text-primary mb-4">Select Your Baggage</h2>

      <div class="row justify-content-center g-4">
        @for (bag of baggageOptions; track bag.id) {
          <div
            class="col-md-4"
            (click)="selectBaggage(bag)"
          >
            <div
              class="card h-100 text-center p-3 shadow-sm"
              [class.border-success]="selectedBaggage?.id === bag.id"
              style="cursor: pointer;"
            >
              <div class="display-1 mb-2">{{ bag.icon }}</div>
              <h5 class="card-title">{{ bag.label }}</h5>
              <p class="card-text text-muted">{{ bag.description }}</p>
              <p class="card-text text-success fw-bold">{{ bag.price }}</p>
            </div>
          </div>
        }
      </div>

      <div class="text-center mt-4">
        <p *ngIf="selectedBaggage" class="text-success mb-2">
          Selected: <strong>{{ selectedBaggage.label }}</strong>
        </p>
        <a class="btn btn-primary btn-lg" (click)="goToResults()" [class.disabled]="!selectedBaggage">
          Continue
        </a>
      </div>
    </div>
  `
})
export class BaggageSelectionComponent {
  private progress = inject(BookingProgressService);
  private router = inject(Router);

  public baggageOptions = [
    {
      id: 'cabin',
      label: 'Cabin Bag',
      icon: '🧳',
      description: 'Small bag (up to 10kg), fits in overhead compartment.',
      price: '$0 (included)'
    },
    {
      id: 'medium',
      label: 'Medium Bag',
      icon: '🎒',
      description: 'Checked bag up to 20kg.',
      price: '$25'
    },
    {
      id: 'large',
      label: 'Large Bag',
      icon: '🧼',
      description: 'Extra large bag up to 32kg.',
      price: '$40'
    }
  ];

  public selectedBaggage: any = null;

  public selectBaggage(bag: any) {
    this.selectedBaggage = bag;
  }

  public goToResults(): void {
    // this.progress.completeStep('baggage-selection');
    // this.router.navigate(['seatmap']);
    this.progress.markBookingProcessAsCompleted('baggage-selection', 'seatmap');
  }
}
