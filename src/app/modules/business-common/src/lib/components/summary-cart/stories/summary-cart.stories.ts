import { moduleMetadata } from '@storybook/angular';
import type { Meta, StoryObj } from '@storybook/angular';

import { SummaryCartComponent } from '../summary-cart.component';

import { DATA_INITIAL_VALUE } from './mocks/data-inital-value.fake';
import { SUMMARY_STORYBOOK_PROVIDERS } from './providers/storybook.provider';
import { TranslationKeys } from '../enums/translation-keys.enum';
import { CommonTranslationKeys } from '@dcx/ui/libs';

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
        [CommonTranslationKeys.Common_Close]: 'Close',
        [TranslationKeys.Basket_Book_Summary_Title]: 'Resumen de compra',
        [TranslationKeys.Schedule_ReturnLabel]: 'Vuelta',
        [TranslationKeys.Schedule_DepartureLabel]: 'Ida',
        [TranslationKeys.Schedule_ExtraDay_Days_Label]: 'día',
        [TranslationKeys.PassengerTypes_Plural_TNG]: 'Tennagers',
        [TranslationKeys.SummaryTypology_PerBooking_Header_Title]: 'Ver detalle',
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
