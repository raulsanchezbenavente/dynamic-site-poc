import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { STORYBOOK_PROVIDERS } from '../../../stories/providers/storybook.provider';
import { AddUpcomingTripsComponent } from '../add-upcoming-trips.component';

const META: Meta<AddUpcomingTripsComponent> = {
  title: 'Molecules/Add upcoming trips',
  component: AddUpcomingTripsComponent,
  render: (args) => ({
    props: {
      backgroundColor: null,
      ...args,
    },
  }),
  parameters: {
    i18nModules: ['FindBookings'],
    i18n: {
      api: true,
      mock: {
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
      },
    },
  },
  decorators: [
    moduleMetadata({
      imports: [],
      declarations: [],
      providers: STORYBOOK_PROVIDERS,
    }),
  ],
};

export default META;
type Story = StoryObj<AddUpcomingTripsComponent>;

export const DEFAULT: Story = {
  name: 'Default',
};
