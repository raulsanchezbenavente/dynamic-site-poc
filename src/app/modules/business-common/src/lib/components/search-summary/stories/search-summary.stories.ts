import { PaxTypeCode } from '@dcx/ui/libs';
import { moduleMetadata } from '@storybook/angular';
import type { Meta, StoryObj } from '@storybook/angular';

import { STORYBOOK_PROVIDERS } from '../../../providers/storybook.providers';
import type { SearchSummaryVM } from '../models/search-summary-vm.model';
import { SearchSummaryComponent } from '../search-summary.component';

// More on how to set up stories at: https://storybook.js.org/docs/7.0/angular/writing-stories/introduction
const META: Meta<SearchSummaryComponent> = {
  title: 'Components/Search Summary',
  component: SearchSummaryComponent,
  tags: ['autodocs'],
  render: (args) => ({
    props: {
      ...args,
    },
  }),
  parameters: {
    i18nModules: ['SearchSummary', 'Common', 'City', 'PassengerTypes'],
    i18n: {
      mock: {
        'Common.To': 'a',
        'Common.Departure_Date': 'Fecha de salida',
        'Common.Return_Date': 'Fecha de regreso',
        'Common.Passengers': 'Pasajeros',

        'City.BOG': 'Bogotá',
        'City.MDE': 'Medellín',

        'PassengerTypes.ADT': 'adulto',
        'PassengerTypes.Plural_ADT': 'adultos',
        'PassengerTypes.CHD': 'niño',
        'PassengerTypes.Plural_CHD': 'niños',
        'PassengerTypes.INF': 'bebé',
        'PassengerTypes.Plural_INF': 'bebés',
      },
    },
  },
  decorators: [
    moduleMetadata({
      imports: [SearchSummaryComponent],
      providers: [STORYBOOK_PROVIDERS],
    }),
  ],
};

export default META;
type Story = StoryObj<SearchSummaryComponent>;

const DATA_DEFAULT: SearchSummaryVM = {
  route: { origin: 'BOG', destination: 'MDE' },
  dates: {
    departureDate: new Date('2024-02-18T10:00:00Z'),
    returnDate: new Date('2024-02-22T15:00:00Z'),
  },
  passengers: [
    { code: PaxTypeCode.ADT, quantity: 2 },
    { code: PaxTypeCode.CHD, quantity: 2 },
    { code: PaxTypeCode.INF, quantity: 1 },
  ],
};

export const DEFAULT: Story = {
  name: 'Default (RT, 2 ADT, 2 CHD, 1 INF)',
  args: {
    data: DATA_DEFAULT,
  },
};

// Variante opcional: solo ida
const DATA_OW: SearchSummaryVM = {
  route: { origin: 'BOG', destination: 'MDE' },
  dates: { departureDate: new Date('2024-02-18T10:00:00Z') },
  passengers: [
    { code: PaxTypeCode.ADT, quantity: 2 },
    { code: PaxTypeCode.CHD, quantity: 1 },
  ],
};

export const ONE_WAY: Story = {
  name: 'One Way (2 ADT + 1 CHD)',
  args: {
    data: DATA_OW,
  },
};
