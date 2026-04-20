import { CurrencySelectorComponent } from '@dcx/storybook/design-system';
import { DropdownLayoutType , CommonTranslationKeys } from '@dcx/ui/libs';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { STORYBOOK_PROVIDERS } from '../../../../stories/providers/storybook.providers';

// More on how to set up stories at: https://storybook.js.org/docs/7.0/angular/writing-stories/introduction
const META: Meta<CurrencySelectorComponent> = {
  title: 'Molecules/Selection Controls/Currency Selector',
  component: CurrencySelectorComponent,
  tags: ['autodocs'],
  render: (args) => ({
    props: {
      ...args,
    },
  }),
  argTypes: {},
  parameters: {
    i18nModules: ['Common', 'Currency'],
    i18n: {
      api: true,
      mock: {
        [CommonTranslationKeys.Common_CurrencySelector_List_Label]: 'Change currency, current',
        [CommonTranslationKeys.Common_A11y_IsSelected]: 'selected',
      },
    },
  },
  decorators: [
    moduleMetadata({
      imports: [CurrencySelectorComponent],
      providers: STORYBOOK_PROVIDERS,
    }),
  ],
};

export default META;
type Story = StoryObj<CurrencySelectorComponent>;

export const DEFAULT: Story = {
  name: 'Default',
  args: {
    config: {
      dropdownModel: {
        isVisible: true,
        value: '',
        config: {
          label: 'Change currency, current',
          icon: {
            name: 'currency-circle',
          },
          layoutConfig: {
            layout: DropdownLayoutType.DEFAULT,
          },
        },
      },
      optionsListConfig: {
        options: [
          {
            code: 'USD',
            name: 'US Dollar',
          },
          {
            code: 'EUR',
            name: 'Euro',
          },
          {
            code: 'BRL',
            name: 'Real (Brasil)',
          },
          {
            code: 'COP',
            name: 'Pesos Colombianos',
          },
        ],
        ariaAttributes: {
          ariaLabel: 'Change currency, current',
        },
      },
    },
    quotedCurrency: 'EUR',
    culture: 'en-US',
  },
};
