import type { Provider } from '@angular/core';
import { MODULE_TRANSLATION_MAP } from '@dcx/module/translation';
import { BookingSessionService, PaxCheckinService } from '@dcx/ui/api-layer';
import { CheckInCommonTranslationKeys } from '@dcx/ui/business-common';
import { CommonTranslationKeys } from '@dcx/ui/libs';
import { type Meta, moduleMetadata, type StoryObj } from '@storybook/angular';
import { of } from 'rxjs';

import { CheckInSummaryComponent } from '../check-in-summary.component';
import { TranslationKeys } from '../enums/translations-keys.enum';

import { BOOKING_SESSION_SCENARIOS } from './mocks/booking-session.mock';
import { SEGMENTS_CHECKIN_STATUS_SCENARIOS } from './mocks/check-in-status.mock';

// More on how to set up stories at: https://storybook.js.org/docs/angular/writing-stories/introduction
const META: Meta<CheckInSummaryComponent> = {
  title: 'Main/Check In Summary',
  component: CheckInSummaryComponent,
  render: (args) => ({
    props: {
      backgroundColor: null,
      ...args,
    },
  }),
  parameters: {
    i18nModules: MODULE_TRANSLATION_MAP['CheckInSummary'],
    i18n: {
      api: false,
      mock: {
        [CommonTranslationKeys.Common_Cancel]: 'Cancel',
        [CommonTranslationKeys.Common_Continue]: 'Continue',
        [CheckInCommonTranslationKeys.CheckIn_Complete]: 'Complete',
        [CheckInCommonTranslationKeys.CheckIn_LifemilesNumber_Label]: 'LifeMiles number',
        [CheckInCommonTranslationKeys.CheckIn_A11y_Loading]: 'Loading...',
        [CheckInCommonTranslationKeys.CheckIn_A11y_PassengerList_AriaLabel]: 'Passenger list',
        [CheckInCommonTranslationKeys.CheckIn_SeatAssigned_Many]: '{{count}} seats assigned',
        [CheckInCommonTranslationKeys.CheckIn_SeatAssigned_One]: 'Seat assigned',
        [CheckInCommonTranslationKeys.CheckIn_StandBy_SubtitleOverbooking]: 'Standby - Overbooking',
        [CheckInCommonTranslationKeys.CheckIn_With_Baby]: 'With infant',
        [CheckInCommonTranslationKeys.CheckIn_BoardingPass_Download_Title]: 'Download boarding pass',
        [TranslationKeys.CheckIn_AirportCounter_SeatAvailability_Info]: 'Seat assignment at airport counter',
        [TranslationKeys.CheckIn_A11y_Passengers_DeselectAll]: 'Deselect all passengers',
        [TranslationKeys.CheckIn_NotAllowed]: 'Not allowed',
        [TranslationKeys.CheckIn_SeatAssigned_None]: 'No seat assigned',
        [TranslationKeys.CheckIn_A11y_Passengers_SelectAll]: 'Select all passengers',
        [TranslationKeys.CheckIn_SelectAllPassengers]: 'Select all passengers',
      },
    },
  },
  decorators: [
    moduleMetadata({
      providers: [createPaxCheckinProvider('allAvailableForCheckIn'), createBookingSessionProvider('default')],
    }),
  ],
};

function createPaxCheckinProvider(scenario: keyof typeof SEGMENTS_CHECKIN_STATUS_SCENARIOS): Provider {
  return {
    provide: PaxCheckinService,
    useValue: {
      getCheckinStatus: () =>
        of({
          result: { data: SEGMENTS_CHECKIN_STATUS_SCENARIOS[scenario] },
          success: true,
        }),
    },
  };
}

function createBookingSessionProvider(scenario: keyof typeof BOOKING_SESSION_SCENARIOS): Provider {
  return {
    provide: BookingSessionService,
    useValue: {
      getBooking: () => of({ result: { data: BOOKING_SESSION_SCENARIOS[scenario] }, success: true }),
    },
  };
}

export default META;
type Story = StoryObj<CheckInSummaryComponent>;

// More on writing stories with args: https://storybook.js.org/docs/angular/writing-stories/args
export const DEFAULT: Story = {
  name: 'Default',
  args: {},
};

export const ALL_AVAILABLE_FOR_CHECK_IN: Story = {
  name: 'All Available for Check-In',
  args: {},
  decorators: [
    moduleMetadata({
      providers: [createPaxCheckinProvider('allAvailableForCheckIn'), createBookingSessionProvider('default')],
    }),
  ],
};

export const ALL_CHECKED_IN: Story = {
  name: 'All Checked In',
  args: {},
  decorators: [
    moduleMetadata({
      providers: [createPaxCheckinProvider('allCheckedIn'), createBookingSessionProvider('default')],
    }),
  ],
};

export const ONLY_ONE_PAX: Story = {
  name: 'Only One Pax',
  args: {},
  decorators: [
    moduleMetadata({
      providers: [createPaxCheckinProvider('allAvailableForCheckIn'), createBookingSessionProvider('onlyOnePax')],
    }),
  ],
};

export const PAX_WITH_INFANT: Story = {
  name: 'Pax with Infant',
  args: {},
  decorators: [
    moduleMetadata({
      providers: [createPaxCheckinProvider('allAvailableForCheckIn'), createBookingSessionProvider('paxWithInfant')],
    }),
  ],
};
