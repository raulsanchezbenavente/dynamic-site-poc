import type { AfterViewInit, OnInit } from '@angular/core';
import { Component, inject, Input, ViewChild } from '@angular/core';
import { MODULE_TRANSLATION_MAP } from '@dcx/module/translation';
import type { Toast } from '@dcx/ui/design-system';
import { ToastService, ToastStatus } from '@dcx/ui/design-system';
import { AuthService, CommonTranslationKeys } from '@dcx/ui/libs';
import { AUTH_STORYBOOK_PROVIDERS, StorybookAuthServiceMock } from '@dcx/ui/storybook-session';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { FindBookingsComponent } from '../find-bookings.component';

import { DATA_INITIAL_VALUE } from './data/data-initial-value.fake';

type FindBookingsVariant = 'upcoming' | 'past' | 'all' | 'loading';

/** Must match the private pageSize in FindBookingsComponent */
const PAGE_SIZE = 3;

@Component({
  selector: 'find-bookings-story-wrapper',
  standalone: true,
  imports: [FindBookingsComponent],
  template: ` <FindBookings #fb /> `,
})
class FindBookingsStoryWrapperComponent implements OnInit, AfterViewInit {
  @ViewChild('fb', { static: true }) public fb!: FindBookingsComponent;
  @Input() public variant: FindBookingsVariant = 'all';
  @Input() public showUpcomingTrips: boolean = true;
  @Input() public showPastTrips: boolean = false;
  @Input() public isPlayground: boolean = false;

  private readonly toastService = inject(ToastService);

  public ngOnInit(): void {
    // Override internalInit BEFORE child's ngOnInit calls it
    // With static: true, fb is resolved before ngOnInit
    this.fb.internalInit = (): void => {
      // Noop: prevent forkJoin HTTP calls that hang in Storybook
    };
  }

  public ngAfterViewInit(): void {
    this.fb.config = DATA_INITIAL_VALUE;

    // Override onAddBooking to skip HTTP call and show success toast directly
    this.fb.onAddBooking = (): void => {
      this.toastService.show(
        {
          status: ToastStatus.SUCCESS,
          message: 'Flight added successfully!',
          autohide: false,
        } as Toast,
        'mytripsAddFlightToast_Id'
      );
    };

    // Set carousel config (normally set by initConfig's HTTP call)
    this.fb.pastTripCarouselConfig = {
      breakPointConfig: {
        XS: { visibleItems: 1, itemsToScroll: 1 },
        S: { visibleItems: 1, itemsToScroll: 1 },
        M: { visibleItems: 1, itemsToScroll: 1 },
        L: { visibleItems: 3, itemsToScroll: 3 },
        XL: { visibleItems: 3, itemsToScroll: 3 },
        XXL: { visibleItems: 3, itemsToScroll: 3 },
      },
    };

    // Set pastTripsNotFoundConfig (normally set by loadTranslations)
    this.fb.pastTripsNotFoundConfig = {
      text: 'No past trips to show',
      secondaryText: 'Past trips will appear here after your flights',
    };

    // Cast to access protected signal
    const fbProtected = this.fb as unknown as {
      translationsReady: { set: (value: boolean) => void };
    };

    // Defer signal mutations to avoid ExpressionChangedAfterItHasBeenCheckedError
    // which causes Storybook to reload in a loop
    setTimeout(() => {
      if (this.isPlayground) {
        this.setupPlayground(fbProtected);
      } else {
        this.setupVariantData(fbProtected);
      }
    });
  }

  private setupVariantData(fbProtected: { translationsReady: { set: (value: boolean) => void } }): void {
    const upcoming = DATA_INITIAL_VALUE.mockData?.upcoming ?? [];
    const past = DATA_INITIAL_VALUE.mockData?.past ?? [];

    switch (this.variant) {
      case 'upcoming':
        this.fb.allUpcomingTrips.set(upcoming);
        this.fb.upcomingTrips.set(upcoming.slice(0, PAGE_SIZE));
        this.fb.totalUpcomingTrips.set(upcoming.length);
        this.fb.totalUpcomingPages.set(Math.ceil(upcoming.length / PAGE_SIZE) || 1);
        this.fb.currentUpcomingPage.set(1);
        this.fb.pastTrips.set([]);
        this.fb.isLoadingBookings.set(false);
        fbProtected.translationsReady.set(true);
        this.fb.isLoaded.set(true);
        break;

      case 'past':
        this.fb.upcomingTrips.set([]);
        this.fb.totalUpcomingTrips.set(0);
        this.fb.pastTrips.set(past);
        this.fb.isLoadingBookings.set(false);
        fbProtected.translationsReady.set(true);
        this.fb.isLoaded.set(true);
        break;

      case 'all':
        this.fb.allUpcomingTrips.set(upcoming);
        this.fb.upcomingTrips.set(upcoming.slice(0, PAGE_SIZE));
        this.fb.totalUpcomingTrips.set(upcoming.length);
        this.fb.totalUpcomingPages.set(Math.ceil(upcoming.length / PAGE_SIZE) || 1);
        this.fb.currentUpcomingPage.set(1);
        this.fb.pastTrips.set(past);
        this.fb.isLoadingBookings.set(false);
        fbProtected.translationsReady.set(true);
        this.fb.isLoaded.set(true);
        break;

      case 'loading':
        this.fb.isLoadingBookings.set(true);
        fbProtected.translationsReady.set(true);
        this.fb.isLoaded.set(false);
        this.fb.upcomingTrips.set([]);
        this.fb.pastTrips.set([]);
        break;
    }
  }

  private setupPlayground(fbProtected: { translationsReady: { set: (value: boolean) => void } }): void {
    const upcoming = DATA_INITIAL_VALUE.mockData?.upcoming ?? [];
    const past = DATA_INITIAL_VALUE.mockData?.past ?? [];

    this.fb.isLoadingBookings.set(false);
    fbProtected.translationsReady.set(true);

    if (this.showUpcomingTrips) {
      this.fb.allUpcomingTrips.set(upcoming);
      this.fb.upcomingTrips.set(upcoming.slice(0, PAGE_SIZE));
      this.fb.totalUpcomingTrips.set(upcoming.length);
      this.fb.totalUpcomingPages.set(Math.ceil(upcoming.length / PAGE_SIZE) || 1);
      this.fb.currentUpcomingPage.set(1);
    } else {
      this.fb.upcomingTrips.set([]);
      this.fb.totalUpcomingTrips.set(0);
    }

    if (this.showPastTrips) {
      this.fb.pastTrips.set(past);
    } else {
      this.fb.pastTrips.set([]);
    }

    this.fb.isLoaded.set(true);
  }
}

const META: Meta<FindBookingsStoryWrapperComponent> = {
  title: 'Main/My Trips',
  component: FindBookingsStoryWrapperComponent,
  parameters: {
    i18nModules: MODULE_TRANSLATION_MAP['FindBookings'],
    i18n: {
      mock: {
        'FindBookings.NoUpcomingTrips': 'You have no trips added. You can enter them manually below.',
        'FindBookings.UpcomingTrips.Title': 'Upcoming Trips',
        'FindBookings.AddUpcomingTrips.Title': 'Add a new flight',
        'FindBookings.AddUpcomingTrips.Form.BookingCode_Label': 'Booking Code',
        'FindBookings.AddUpcomingTrips.Form.BookingCode_Hint': 'Example: AAAAAA',
        'FindBookings.AddUpcomingTrips.Form.BookingCode_RequiredMessage': 'The PNR is required.',
        'FindBookings.AddUpcomingTrips.Form.BookingCode_PatternMessage': 'Invalid booking code format',
        'FindBookings.AddUpcomingTrips.Form.BookingCode_MinLengthMessage': 'Booking code too short',
        'FindBookings.AddUpcomingTrips.Form.Surname_Label': 'Last Name(s)',
        'FindBookings.AddUpcomingTrips.Form.Surname_Hint': 'As it appears on the booking. Example: Sanchez Pulido',
        'FindBookings.AddUpcomingTrips.Form.Surname_RequiredMessage': 'The last name is required.',
        'FindBookings.AddUpcomingTrips.Form.Surname_PatternMessage': 'Invalid last name format.',
        'FindBookings.AddUpcomingTrips.Form.Button': 'Add flight',
        'FindBookings.PastTrips.Title': 'Past Trips',
        'FindBookings.NoPastTrips': 'No past trips found',
        'FindBookings.PastTripsInfo': 'You can enter them manually below.',
        'ManageBookingCard.CheckInButtonLabel': 'Check-in',
        'ManageBookingCard.ManageButtonLabel': 'Manage Booking',
        'ManageBookingCard.CheckBaggageButtonLabel': 'Check Baggage',
        'FindBookings.NoUpcomingTripsMessage': 'No upcoming trips',
        'FindBookings.NoPastTripsMessage': 'No past trips',
        'FindBookings.AddTripButtonLabel': 'Add Trip',
        'FindBookings.AddTrip.Alert_Add_Message': 'Flight added successfully!',
        'FindBookings.Loading': 'Loading...',
        [CommonTranslationKeys.Common_Carriers_OperatedBy]: 'Operado por',
        [CommonTranslationKeys.Common_Terminal]: 'Terminal',
        [CommonTranslationKeys.Common_To]: 'a',
        'City.BOG': 'Bogotá',
        'City.MIA': 'Miami',
        'City.MAD': 'Madrid',
        'City.BCN': 'Barcelona',
        'City.JFK': 'New York',
        'City.LAX': 'Los Angeles',
        'City.SFO': 'San Francisco',
        'Journey.Status.Confirmed': 'Confirmado',
        'Journey.Status.Delayed': 'Retrasado',
        'Journey.Status.Cancelled': 'Cancelado',
        'Schedule.Connection_StopLabel': 'Stop:',
        'Schedule.Connection_Title': 'Detalles del vuelo',
        'Schedule.Direct': 'Direct',
        'Schedule.ExtraDay_AccessibleLabel': 'Llegada {{count}} después',
        'Schedule.ExtraDay.Day_Label': 'day',
        'Schedule.ExtraDay.Days_Label': 'day',
        'Schedule.Stop': 'stop',
        'Schedule.Stops': 'stops',
        'Schedule.Total_TravelTime_Label': 'Total travel time:',
        'Schedule.PreviousTimeOfDeparture_Label': 'Hora de salida originalmente programada',
        'Schedule.PreviousTimeOfArrival_Label': 'Hora de llegada originalmente programada',
        'Schedule.NewTimeOfDeparture_Label': 'Nuevo horario de salida',
        'Schedule.NewTimeOfArrival_Label': 'Nuevo horario de llegada',
        'Schedule.ExtraDay.Arrival_NextDay': 'Llegada al día siguiente',
        'Schedule.ExtraDay.Arrival_NDaysLater': 'Llega {{count}} días después',
      },
    },
  },
  decorators: [
    moduleMetadata({
      imports: [FindBookingsStoryWrapperComponent],
      providers: [
        ...AUTH_STORYBOOK_PROVIDERS,
        { provide: AuthService, useValue: StorybookAuthServiceMock({ authenticated: true, delayMs: 0 }) },
      ],
    }),
  ],
  argTypes: {
    variant: { table: { disable: true } },
    isPlayground: { table: { disable: true } },
    showUpcomingTrips: { table: { disable: true } },
    showPastTrips: { table: { disable: true } },
    fb: { table: { disable: true } },
    ngOnInit: { table: { disable: true } },
    ngAfterViewInit: { table: { disable: true } },
  },
};

export default META;
type Story = StoryObj<FindBookingsStoryWrapperComponent>;

export const UPCOMING_TRIPS_NO_PAST_TRIPS: Story = {
  name: 'Upcoming Trips (No Past Trips)',
  args: {
    variant: 'upcoming',
    isPlayground: false,
  },
};

export const PAST_TRIPS_NO_UPCOMING_TRIPS: Story = {
  name: 'Past Trips (No Upcoming Trips)',
  args: {
    variant: 'past',
    isPlayground: false,
  },
};

export const UPCOMING_AND_PAST_TRIPS: Story = {
  name: 'Upcoming & Past Trips',
  args: {
    variant: 'all',
    isPlayground: false,
  },
};

export const LOADING: Story = {
  name: 'Loading State',
  args: {
    variant: 'loading',
    isPlayground: false,
  },
};

export const PLAYGROUND: Story = {
  name: '__Playground',
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    isPlayground: true,
    showUpcomingTrips: true,
    showPastTrips: false,
  },
  argTypes: {
    variant: { table: { disable: true } },
    isPlayground: { table: { disable: true } },
    fb: { table: { disable: true } },
    ngOnInit: { table: { disable: true } },
    ngAfterViewInit: { table: { disable: true } },
    showUpcomingTrips: {
      control: 'boolean',
      name: 'Show Upcoming Trips',
      description: 'Display upcoming trips section with mock data',
      table: {
        category: 'Content',
        type: { summary: 'boolean' },
      },
    },
    showPastTrips: {
      control: 'boolean',
      name: 'Show Past Trips',
      description: 'Display past trips carousel with mock data',
      table: {
        category: 'Content',
        type: { summary: 'boolean' },
      },
    },
  },
};
