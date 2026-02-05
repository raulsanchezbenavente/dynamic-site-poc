import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';

import { BookingProgressService } from '../../../services/booking-progress/booking-progress.service';

type DateOption = {
  day: string;
  price: string;
  date: string;
  active?: boolean;
};

type FlightResult = {
  id: string;
  origin: string;
  destination: string;
  departure: string;
  arrival: string;
  duration: string;
  stops: string;
  operatedBy: string;
  price: string;
  seatsLeft?: number;
  badge?: string;
};

@Component({
  selector: 'pb-results',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './results.component.html',
  styleUrl: './results.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResultsComponent {
  private progress = inject(BookingProgressService);
  private router = inject(Router);

  public dateOptions: DateOption[] = [
    { day: 'Jue, Feb 05', price: '510,35', date: '2026-02-05' },
    { day: 'Vie, Feb 06', price: '510,35', date: '2026-02-06' },
    { day: 'Sáb, Feb 07', price: '470,35', date: '2026-02-07' },
    { day: 'Dom, Feb 08', price: '440,35', date: '2026-02-08', active: true },
    { day: 'Lun, Feb 09', price: '344,35', date: '2026-02-09' },
    { day: 'Mar, Feb 10', price: '344,35', date: '2026-02-10' },
  ];

  public flights: FlightResult[] = [
    {
      id: 'm-a-0120',
      origin: 'MAD',
      destination: 'AUC',
      departure: '01:20',
      arrival: '11:55',
      duration: '16h 35m',
      stops: '1 Parada',
      operatedBy: 'Operado por Avianca y Clic For Avianca Express',
      price: '640,35',
      seatsLeft: 4,
    },
    {
      id: 'm-a-1050',
      origin: 'MAD',
      destination: 'AUC',
      departure: '10:50',
      arrival: '20:15',
      duration: '15h 25m',
      stops: '1 Parada',
      operatedBy: 'Operado por Avianca y Clic Air S.A.',
      price: '440,35',
      badge: 'Mejor precio',
    },
    {
      id: 'm-a-1425',
      origin: 'MAD',
      destination: 'AUC',
      departure: '14:25',
      arrival: '23:40',
      duration: '14h 15m',
      stops: '1 Parada',
      operatedBy: 'Operado por Avianca',
      price: '520,90',
      seatsLeft: 8,
    },
  ];

  public goToResults(): void {
    // this.progress.completeStep('results');
    // this.router.navigate(['baggage-selection']);
    this.progress.markBookingProcessAsCompleted('results', 'baggage-selection');
  }
}
