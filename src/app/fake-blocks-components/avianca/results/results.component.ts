import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

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
  imports: [CommonModule, TranslateModule],
  templateUrl: './results.component.html',
  styleUrl: './results.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResultsComponent {
  private progress = inject(BookingProgressService);
  private router = inject(Router);

  public dateOptions: DateOption[] = [
    { day: 'RESULTS.DATE_OPTIONS.DATE_1', price: '510,35', date: '2026-02-05' },
    { day: 'RESULTS.DATE_OPTIONS.DATE_2', price: '510,35', date: '2026-02-06' },
    { day: 'RESULTS.DATE_OPTIONS.DATE_3', price: '470,35', date: '2026-02-07' },
    { day: 'RESULTS.DATE_OPTIONS.DATE_4', price: '440,35', date: '2026-02-08', active: true },
    { day: 'RESULTS.DATE_OPTIONS.DATE_5', price: '344,35', date: '2026-02-09' },
    { day: 'RESULTS.DATE_OPTIONS.DATE_6', price: '344,35', date: '2026-02-10' },
  ];

  public flights: FlightResult[] = [
    {
      id: 'm-a-0120',
      origin: 'MAD',
      destination: 'AUC',
      departure: '01:20',
      arrival: '11:55',
      duration: '16h 35m',
      stops: 'RESULTS.STOPS.ONE_STOP',
      operatedBy: 'RESULTS.OPERATED_BY.AVIANCA_CLIC',
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
      stops: 'RESULTS.STOPS.ONE_STOP',
      operatedBy: 'RESULTS.OPERATED_BY.AVIANCA_CLIC_AIR',
      price: '440,35',
      badge: 'RESULTS.BADGE_BEST_PRICE',
    },
    {
      id: 'm-a-1425',
      origin: 'MAD',
      destination: 'AUC',
      departure: '14:25',
      arrival: '23:40',
      duration: '14h 15m',
      stops: 'RESULTS.STOPS.ONE_STOP',
      operatedBy: 'RESULTS.OPERATED_BY.AVIANCA',
      price: '520,90',
      seatsLeft: 8,
    },
  ];

  public selectDate(option: DateOption): void {
    this.dateOptions = this.dateOptions.map((d) => ({
      ...d,
      active: d.date === option.date,
    }));
  }

  public goToResults(): void {
    // this.progress.completeStep('results');
    // this.router.navigate(['baggage-selection']);
    this.progress.markBookingProcessAsCompleted('results', 'baggage-selection');
  }
}
