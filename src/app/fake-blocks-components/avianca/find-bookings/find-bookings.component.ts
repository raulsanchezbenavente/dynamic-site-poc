import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

export type LmTripCard = {
  fromCity: string;
  toCity: string;
  dateText: string;
  statusText: string;
  departureTime: string;
  departureCode: string;
  arrivalTime: string;
  arrivalCode: string;
  directText: string;
  durationText: string;
  operatedByText: string;
  ctaText: string;
};

@Component({
  selector: 'find-bookings',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './find-bookings.component.html',
  styleUrl: './find-bookings.component.scss',
})
export class FindBookingsComponent {
  public title = input<string>('TRIPS.TITLE');
  public trips = input<LmTripCard[]>([
    {
      fromCity: 'Medellín',
      toCity: 'Bogotá',
      dateText: 'Viernes, 23 de enero de 2026',
      statusText: 'TRIPS.STATUS_CONFIRMED',
      departureTime: '04:20',
      departureCode: 'MDE',
      arrivalTime: '05:25',
      arrivalCode: 'BOG',
      directText: 'TRIPS.DIRECT',
      durationText: '1h 5m',
      operatedByText: 'TRIPS.OPERATED_BY_AVIANCA',
      ctaText: 'TRIPS.CTA_CHECKIN',
    },
    {
      fromCity: 'Barcelona',
      toCity: 'Bogotá',
      dateText: 'Viernes, 23 de enero de 2026',
      statusText: 'TRIPS.STATUS_CONFIRMED',
      departureTime: '12:50',
      departureCode: 'BCN',
      arrivalTime: '17:45',
      arrivalCode: 'BOG',
      directText: 'TRIPS.DIRECT',
      durationText: '4h 55m',
      operatedByText: 'TRIPS.OPERATED_BY_AVIANCA',
      ctaText: 'TRIPS.CTA_CHECKIN',
    },
  ]);

  public trackByTrip(_: number, t: LmTripCard): string {
    return `${t.fromCity}-${t.toCity}-${t.departureTime}-${t.arrivalTime}`;
  }

  public noop(): void {}
}
