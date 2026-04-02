import { signal, type WritableSignal } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { moduleMetadata } from '@storybook/angular';
import type { Meta, StoryObj } from '@storybook/angular';

import { STORYBOOK_PROVIDERS } from '../../../providers/storybook.providers';
import type { PointsOfSaleData } from '../models/points-of-sale-data.model';
import { PointsOfSaleComponent } from '../points-of-sale.component';

import { DATA_INITIAL_VALUE } from './mocks/data-inital-value.fake';

const createDataSignal = (initialData: PointsOfSaleData = DATA_INITIAL_VALUE): WritableSignal<PointsOfSaleData> =>
  signal(structuredClone(initialData));

// More on how to set up stories at: https://storybook.js.org/docs/7.0/angular/writing-stories/introduction
const META: Meta<PointsOfSaleComponent> = {
  title: 'Components/Points of Sale',
  component: PointsOfSaleComponent,
  tags: ['autodocs'],
  render: (args) => ({
    props: {
      ...args,
      data: args.data ?? createDataSignal(),
    },
  }),
  parameters: {
    i18nModules: ['PointsOfSale', 'Country', 'Common'],
    i18n: {
      api: false,
      mock: {
        'Country.US': 'United States',
        'Country.CO': 'Colombia',
        'Country.ES': 'España',
        'Country.GB': 'United Kingdom',
        'Country.PE': 'Perú',
        'PointsOfSale.Button_Apply_Label': 'Apply',
      },
    },
  },
  decorators: [
    moduleMetadata({
      imports: [PointsOfSaleComponent, NgbModule],
      providers: [STORYBOOK_PROVIDERS],
    }),
  ],
};

export default META;
type Story = StoryObj<PointsOfSaleComponent>;

export const DEFAULT: Story = {
  name: 'Default',
  args: {
    data: createDataSignal(),
  },
};
