import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { BookingProgressService } from '../../../services/booking-progress/booking-progress.service';
import { PageNavigationService } from '../../../services/page-navigation/page-navigation.service';

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

type FareOption = {
  key: string;
  titleKey: string;
  price: string;
  accent: string;
  badgeKey?: string;
  perks: Array<{ textKey: string; params?: Record<string, string | number>; muted?: boolean }>;
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
  private pageNavigation = inject(PageNavigationService);

  public expandedFlightId: string | null = null;

  public dateOptions: DateOption[] = [
    { day: 'RESULTS.DATE_OPTIONS.DATE_1', price: '510,35', date: '2026-02-05' },
    { day: 'RESULTS.DATE_OPTIONS.DATE_2', price: '510,35', date: '2026-02-06' },
    { day: 'RESULTS.DATE_OPTIONS.DATE_3', price: '470,35', date: '2026-02-07' },
    { day: 'RESULTS.DATE_OPTIONS.DATE_4', price: '440,35', date: '2026-02-08', active: true },
    { day: 'RESULTS.DATE_OPTIONS.DATE_5', price: '344,35', date: '2026-02-09' },
    { day: 'RESULTS.DATE_OPTIONS.DATE_6', price: '344,35', date: '2026-02-10' },
  ];

  private flightsByDate: Record<string, FlightResult[]> = {
    '2026-02-05': [
      {
        id: 'm-a-0120',
        origin: 'MAD',
        destination: 'AUC',
        departure: '01:20',
        arrival: '11:55',
        duration: '16h 35m',
        stops: 'RESULTS.STOPS.ONE_STOP',
        operatedBy: 'RESULTS.OPERATED_BY.AVIANCA_CLIC',
        price: '670,35',
        seatsLeft: 6,
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
        price: '510,35',
        badge: 'RESULTS.BADGE_BEST_PRICE',
      },
      {
        id: 'm-a-1810',
        origin: 'MAD',
        destination: 'AUC',
        departure: '18:10',
        arrival: '03:20',
        duration: '15h 10m',
        stops: 'RESULTS.STOPS.ONE_STOP',
        operatedBy: 'RESULTS.OPERATED_BY.AVIANCA',
        price: '560,90',
        seatsLeft: 3,
      },
    ],
    '2026-02-06': [
      {
        id: 'm-a-0630',
        origin: 'MAD',
        destination: 'AUC',
        departure: '06:30',
        arrival: '16:05',
        duration: '15h 35m',
        stops: 'RESULTS.STOPS.ONE_STOP',
        operatedBy: 'RESULTS.OPERATED_BY.AVIANCA_CLIC',
        price: '610,35',
        seatsLeft: 5,
      },
      {
        id: 'm-a-1120',
        origin: 'MAD',
        destination: 'AUC',
        departure: '11:20',
        arrival: '20:55',
        duration: '15h 35m',
        stops: 'RESULTS.STOPS.ONE_STOP',
        operatedBy: 'RESULTS.OPERATED_BY.AVIANCA_CLIC_AIR',
        price: '510,35',
        badge: 'RESULTS.BADGE_BEST_PRICE',
      },
    ],
    '2026-02-07': [
      {
        id: 'm-a-0710',
        origin: 'MAD',
        destination: 'AUC',
        departure: '07:10',
        arrival: '16:40',
        duration: '15h 30m',
        stops: 'RESULTS.STOPS.ONE_STOP',
        operatedBy: 'RESULTS.OPERATED_BY.AVIANCA_CLIC',
        price: '560,35',
        seatsLeft: 6,
      },
      {
        id: 'm-a-1205',
        origin: 'MAD',
        destination: 'AUC',
        departure: '12:05',
        arrival: '21:30',
        duration: '15h 25m',
        stops: 'RESULTS.STOPS.ONE_STOP',
        operatedBy: 'RESULTS.OPERATED_BY.AVIANCA_CLIC_AIR',
        price: '470,35',
        badge: 'RESULTS.BADGE_BEST_PRICE',
      },
      {
        id: 'm-a-1700',
        origin: 'MAD',
        destination: 'AUC',
        departure: '17:00',
        arrival: '02:15',
        duration: '15h 15m',
        stops: 'RESULTS.STOPS.ONE_STOP',
        operatedBy: 'RESULTS.OPERATED_BY.AVIANCA',
        price: '510,90',
        seatsLeft: 4,
      },
    ],
    '2026-02-08': [
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
    ],
    '2026-02-09': [
      {
        id: 'm-a-0540',
        origin: 'MAD',
        destination: 'AUC',
        departure: '05:40',
        arrival: '15:20',
        duration: '15h 40m',
        stops: 'RESULTS.STOPS.ONE_STOP',
        operatedBy: 'RESULTS.OPERATED_BY.AVIANCA_CLIC',
        price: '410,35',
        seatsLeft: 9,
      },
      {
        id: 'm-a-1135',
        origin: 'MAD',
        destination: 'AUC',
        departure: '11:35',
        arrival: '20:55',
        duration: '15h 20m',
        stops: 'RESULTS.STOPS.ONE_STOP',
        operatedBy: 'RESULTS.OPERATED_BY.AVIANCA_CLIC_AIR',
        price: '344,35',
        badge: 'RESULTS.BADGE_BEST_PRICE',
      },
      {
        id: 'm-a-1630',
        origin: 'MAD',
        destination: 'AUC',
        departure: '16:30',
        arrival: '01:55',
        duration: '15h 25m',
        stops: 'RESULTS.STOPS.ONE_STOP',
        operatedBy: 'RESULTS.OPERATED_BY.AVIANCA',
        price: '390,90',
        seatsLeft: 11,
      },
      {
        id: 'm-a-2015',
        origin: 'MAD',
        destination: 'AUC',
        departure: '20:15',
        arrival: '05:45',
        duration: '15h 30m',
        stops: 'RESULTS.STOPS.ONE_STOP',
        operatedBy: 'RESULTS.OPERATED_BY.AVIANCA',
        price: '430,90',
        seatsLeft: 5,
      },
    ],
    '2026-02-10': [
      {
        id: 'm-a-0605',
        origin: 'MAD',
        destination: 'AUC',
        departure: '06:05',
        arrival: '15:40',
        duration: '15h 35m',
        stops: 'RESULTS.STOPS.ONE_STOP',
        operatedBy: 'RESULTS.OPERATED_BY.AVIANCA_CLIC',
        price: '420,35',
        seatsLeft: 10,
      },
      {
        id: 'm-a-1210',
        origin: 'MAD',
        destination: 'AUC',
        departure: '12:10',
        arrival: '21:30',
        duration: '15h 20m',
        stops: 'RESULTS.STOPS.ONE_STOP',
        operatedBy: 'RESULTS.OPERATED_BY.AVIANCA_CLIC_AIR',
        price: '344,35',
        badge: 'RESULTS.BADGE_BEST_PRICE',
      },
      {
        id: 'm-a-1750',
        origin: 'MAD',
        destination: 'AUC',
        departure: '17:50',
        arrival: '03:05',
        duration: '15h 15m',
        stops: 'RESULTS.STOPS.ONE_STOP',
        operatedBy: 'RESULTS.OPERATED_BY.AVIANCA',
        price: '395,90',
        seatsLeft: 12,
      },
    ],
  };

  public flights: FlightResult[] = this.flightsByDate[this.getActiveDate()];

  public fareOptions: FareOption[] = [
    {
      key: 'light',
      titleKey: 'RESULTS.FARES.LIGHT.TITLE',
      price: '595,35',
      accent: '#ff2d2d',
      perks: [
        { textKey: 'RESULTS.FARES.PERKS.PERSONAL_ITEM' },
        { textKey: 'RESULTS.FARES.PERKS.CARRY_ON_10KG' },
        { textKey: 'RESULTS.FARES.PERKS.EARN_MILES_3' },
        { textKey: 'RESULTS.FARES.PERKS.MEAL_ONBOARD' },
        {
          textKey: 'RESULTS.FARES.PERKS.CHECKED_BAG_FROM',
          params: { price: '€ 90,00' },
          muted: true,
        },
        { textKey: 'RESULTS.FARES.PERKS.AIRPORT_CHECKIN', muted: true },
        {
          textKey: 'RESULTS.FARES.PERKS.SEAT_SELECTION_FROM',
          params: { price: '€ 34,51' },
          muted: true,
        },
        { textKey: 'RESULTS.FARES.PERKS.FLIGHT_CHANGES', muted: true },
        { textKey: 'RESULTS.FARES.PERKS.REFUNDS', muted: true },
      ],
    },
    {
      key: 'classic',
      titleKey: 'RESULTS.FARES.CLASSIC.TITLE',
      price: '642,35',
      accent: '#b10087',
      badgeKey: 'RESULTS.FARES.BADGE_BEST_OPTION',
      perks: [
        { textKey: 'RESULTS.FARES.PERKS.PERSONAL_ITEM' },
        { textKey: 'RESULTS.FARES.PERKS.CARRY_ON_10KG' },
        { textKey: 'RESULTS.FARES.PERKS.CHECKED_BAG_23KG' },
        { textKey: 'RESULTS.FARES.PERKS.AIRPORT_CHECKIN' },
        { textKey: 'RESULTS.FARES.PERKS.ECONOMY_SEAT_INCLUDED' },
        { textKey: 'RESULTS.FARES.PERKS.EARN_MILES_6' },
        { textKey: 'RESULTS.FARES.PERKS.MEAL_ONBOARD' },
        { textKey: 'RESULTS.FARES.PERKS.FLIGHT_CHANGES', muted: true },
        { textKey: 'RESULTS.FARES.PERKS.REFUNDS', muted: true },
      ],
    },
    {
      key: 'flex',
      titleKey: 'RESULTS.FARES.FLEX.TITLE',
      price: '764,35',
      accent: '#f36c00',
      perks: [
        { textKey: 'RESULTS.FARES.PERKS.PERSONAL_ITEM' },
        { textKey: 'RESULTS.FARES.PERKS.CARRY_ON_10KG' },
        { textKey: 'RESULTS.FARES.PERKS.CHECKED_BAG_23KG' },
        { textKey: 'RESULTS.FARES.PERKS.AIRPORT_CHECKIN' },
        { textKey: 'RESULTS.FARES.PERKS.SEAT_PLUS' },
        { textKey: 'RESULTS.FARES.PERKS.EARN_MILES_8' },
        { textKey: 'RESULTS.FARES.PERKS.MEAL_ONBOARD' },
        { textKey: 'RESULTS.FARES.PERKS.FLIGHT_CHANGES' },
        { textKey: 'RESULTS.FARES.PERKS.REFUNDS' },
      ],
    },
  ];

  public selectDate(option: DateOption): void {
    this.dateOptions = this.dateOptions.map((d) => ({
      ...d,
      active: d.date === option.date,
    }));
    this.expandedFlightId = null;
    this.flights = this.flightsByDate[option.date] ?? [];
  }

  public toggleFare(flightId: string): void {
    this.expandedFlightId = this.expandedFlightId === flightId ? null : flightId;
  }

  public selectFare(): void {
    void this.pageNavigation.navigateByPageId('1-1', 'personal-data');
  }

  public goToResults(): void {
    // this.progress.completeStep('results');
    // this.router.navigate(['baggage-selection']);
    this.progress.markBookingProcessAsCompleted('results', 'baggage-selection');
  }

  private getActiveDate(): string {
    return this.dateOptions.find((d) => d.active)?.date ?? this.dateOptions[0].date;
  }
}
