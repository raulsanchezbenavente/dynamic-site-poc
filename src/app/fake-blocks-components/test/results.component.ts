import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { BookingProgressService } from '../../services/booking-progress/booking-progress.service';

@Component({
  selector: 'pb-results',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container my-5">
      <h2 class="mb-4 text-primary">Available Flights</h2>
      <div *ngFor="let flight of flights" class="card mb-3 shadow-sm">
        <div class="card-body d-flex flex-column flex-md-row justify-content-between align-items-center">
          <div class="mb-3 mb-md-0 text-center text-md-start">
            <h5 class="card-title mb-1">✈️ {{ flight.origin }} → {{ flight.destination }}</h5>
            <p class="mb-0 text-muted">{{ flight.departure }} - {{ flight.arrival }} | ⏱ {{ flight.duration }}</p>
          </div>
          <div class="text-center">
            <span class="badge me-2" [ngClass]="getClassBadge(flight.class)">
              {{ flight.class }}
            </span>
            <span class="badge bg-secondary me-2">💺 Seat Included</span>
            <span class="badge bg-light text-dark">🎒 Hand luggage</span>
          </div>
          <div class="text-center">
            <div class="d-flex align-items-center gap-2">
              <span class="fs-4 text-success fw-medium">💰{{ flight.price }}</span>
              <button class="btn btn-outline-primary btn-sm" (click)="goToResults()">Select</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ResultsComponent {
  private progress = inject(BookingProgressService);
  private router = inject(Router);

  public flights = [
    { origin: 'New York (JFK)', destination: 'London (LHR)', departure: '08:30', arrival: '20:15', duration: '7h 45m', class: 'Economy', price: '$499' },
    { origin: 'Madrid (MAD)', destination: 'Tokyo (NRT)', departure: '12:00', arrival: '06:20 +1', duration: '14h 20m', class: 'Business', price: '$1299' },
    { origin: 'Paris (CDG)', destination: 'Rome (FCO)', departure: '09:15', arrival: '11:00', duration: '1h 45m', class: 'Economy', price: '$89' },
    { origin: 'Dubai (DXB)', destination: 'Los Angeles (LAX)', departure: '01:00', arrival: '11:45', duration: '16h 45m', class: 'Premium Economy', price: '$899' },
    { origin: 'Berlin (BER)', destination: 'Toronto (YYZ)', departure: '14:00', arrival: '18:30', duration: '8h 30m', class: 'Economy', price: '$620' },
    { origin: 'Barcelona (BCN)', destination: 'Lisbon (LIS)', departure: '10:20', arrival: '11:50', duration: '1h 30m', class: 'Economy', price: '$75' },
    { origin: 'Chicago (ORD)', destination: 'San Francisco (SFO)', departure: '15:45', arrival: '18:15', duration: '4h 30m', class: 'Business', price: '$780' },
    { origin: 'Sydney (SYD)', destination: 'Auckland (AKL)', departure: '07:00', arrival: '12:10', duration: '3h 10m', class: 'Economy', price: '$430' },
    { origin: 'Doha (DOH)', destination: 'Bangkok (BKK)', departure: '23:00', arrival: '10:30 +1', duration: '7h 30m', class: 'Business', price: '$1110' },
    { origin: 'Moscow (SVO)', destination: 'Beijing (PEK)', departure: '13:15', arrival: '02:40 +1', duration: '9h 25m', class: 'Economy', price: '$510' },
    { origin: 'Amsterdam (AMS)', destination: 'Copenhagen (CPH)', departure: '08:45', arrival: '10:20', duration: '1h 35m', class: 'Economy', price: '$95' },
    { origin: 'Vienna (VIE)', destination: 'Istanbul (IST)', departure: '16:00', arrival: '18:40', duration: '2h 40m', class: 'Economy', price: '$155' },
    { origin: 'Buenos Aires (EZE)', destination: 'Lima (LIM)', departure: '05:00', arrival: '08:30', duration: '4h 30m', class: 'Economy', price: '$270' },
    { origin: 'Seoul (ICN)', destination: 'Singapore (SIN)', departure: '20:15', arrival: '01:30 +1', duration: '6h 15m', class: 'Premium Economy', price: '$720' },
    { origin: 'Mexico City (MEX)', destination: 'New York (JFK)', departure: '06:30', arrival: '13:40', duration: '5h 10m', class: 'Economy', price: '$350' }
  ];

  public getClassBadge(flightClass: string): string {
    switch (flightClass) {
      case 'Economy':
        return 'bg-success text-white';
      case 'Business':
        return 'bg-warning text-dark';
      case 'Premium Economy':
        return 'bg-primary text-white';
      default:
        return 'bg-secondary text-white';
    }
  }

  public goToResults(): void {
    // this.progress.completeStep('results');
    // this.router.navigate(['baggage-selection']);
    this.progress.markBookingProcessAsCompleted('results', 'baggage-selection');
  }
}
