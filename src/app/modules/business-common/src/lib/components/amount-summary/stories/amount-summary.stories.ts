import { ButtonStyles, LayoutSize , CommonTranslationKeys } from '@dcx/ui/libs';
import { moduleMetadata } from '@storybook/angular';
import type { Meta, StoryObj } from '@storybook/angular';

import { STORYBOOK_PROVIDERS } from '../../../providers/storybook.providers';
import { AmountSummaryComponent } from '../amount-summary.component';
import type { AmountSummaryVM } from '../models/amount-summary-vm.model';

// More on how to set up stories at: https://storybook.js.org/docs/angular/writing-stories/introduction
const META: Meta<AmountSummaryComponent> = {
  title: 'Components/Amount Summary',
  component: AmountSummaryComponent,
  tags: ['autodocs'],
  render: (args) => ({
    props: {
      ...args,
    },
  }),
  parameters: {
    i18nModules: ['Common'],
    i18n: {
      api: false,
      mock: {
        [CommonTranslationKeys.Common_Confirm_Btn]: 'Confirm',
        [CommonTranslationKeys.Common_Cancel_Btn]: 'Cancel',
      },
    },
  },
  decorators: [
    moduleMetadata({
      imports: [AmountSummaryComponent],
      providers: [STORYBOOK_PROVIDERS],
    }),
  ],
};

export default META;
type Story = StoryObj<AmountSummaryComponent>;

// More on writing stories with args: https://storybook.js.org/docs/angular/writing-stories/args
export const DEFAULT: Story = {
  name: 'Default',
  args: {
    data: {
      priceDisplay: {
        prefixText: 'Total',
        currency: 'USD',
        price: 250.5,
      },
    } as AmountSummaryVM,
  },
};

export const WITH_CUSTOM_BUTTONS: Story = {
  name: 'With Custom Buttons',
  args: {
    data: {
      priceDisplay: {
        prefixText: 'Total a pagar',
        currency: 'COP',
        price: 450000,
      },
      primaryButton: {
        label: 'Confirmar compra',
        layout: {
          size: LayoutSize.MEDIUM,
          style: ButtonStyles.ACTION,
        },
      },
      secondaryButton: {
        label: 'Cancelar',
        layout: {
          size: LayoutSize.MEDIUM,
          style: ButtonStyles.SECONDARY,
        },
      },
    } as AmountSummaryVM,
  },
};

export const WITH_NAVIGATION: Story = {
  name: 'With Navigation Buttons',
  args: {
    data: {
      priceDisplay: {
        prefixText: 'Subtotal',
        currency: 'EUR',
        price: 1250.75,
      },
      previousButton: {
        label: 'Anterior',
        layout: {
          size: LayoutSize.MEDIUM,
          style: ButtonStyles.SECONDARY,
        },
      },
      nextButton: {
        label: 'Siguiente',
        layout: {
          size: LayoutSize.MEDIUM,
          style: ButtonStyles.ACTION,
        },
      },
    } as AmountSummaryVM,
  },
};

export const HIGH_AMOUNT: Story = {
  name: 'High Amount',
  args: {
    data: {
      priceDisplay: {
        prefixText: 'Total',
        currency: 'COP',
        price: 15450000,
      },
    } as AmountSummaryVM,
  },
};
