import { moduleMetadata } from '@storybook/angular';
import type { Meta, StoryObj } from '@storybook/angular';

import { SummaryCartComponent } from '../summary-cart.component';

import { DATA_INITIAL_VALUE } from './mocks/data-inital-value.fake';
import { SUMMARY_STORYBOOK_PROVIDERS } from './providers/storybook.provider';

// More on how to set up stories at: https://storybook.js.org/docs/angular/writing-stories/introduction
const META: Meta<SummaryCartComponent> = {
  title: 'Components/Summary Cart',
  component: SummaryCartComponent,
  render: (args) => ({
    props: {
      backgroundColor: null,
      ...args,
    },
  }),
  parameters: {
    i18nModules: ['Common', 'Journey', ' City', 'Schedule', 'PassengerTypes', 'SummaryTypology', 'Ibe-codes'],
    i18n: {
      mock: {
        'Common.Close': 'Close',
        'Basket.Book_Summary_Title': 'Resumen de compra',
        'Schedule.ReturnLabel': 'Vuelta',
        'Schedule.DepartureLabel': 'Ida',
        'Schedule.ExtraDay.Days_Label': 'día',
        'PassengerTypes.Plural_TNG': 'Tennagers',
        'SummaryTypology.PerBooking.Header_Title': 'Ver detalle',
      },
    },
  },
  decorators: [
    moduleMetadata({
      imports: [],
      providers: [SUMMARY_STORYBOOK_PROVIDERS],
    }),
  ],
};

export default META;
type Story = StoryObj<SummaryCartComponent>;

// More on writing stories with args: https://storybook.js.org/docs/angular/writing-stories/args
export const DEFAULT: Story = {
  name: 'Default',
  args: {
    config: DATA_INITIAL_VALUE,
  },
};
