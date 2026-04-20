import { ToggleMaskedComponent } from '@dcx/storybook/design-system';

import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { STORYBOOK_PROVIDERS } from '../../../../stories/providers/storybook.providers';
import { CommonTranslationKeys } from '@dcx/ui/libs';

// More on how to set up stories at: https://storybook.js.org/docs/7.0/angular/writing-stories/introduction
const meta: Meta<ToggleMaskedComponent> = {
  title: 'Atoms/Toggle/Toggle Masked',
  component: ToggleMaskedComponent,
  tags: ['autodocs'],
  render: (args) => ({
    props: {
      ...args,
    },
  }),
  decorators: [
    moduleMetadata({
      imports: [],
      providers: STORYBOOK_PROVIDERS,
    }),
  ],
};

export default meta;
type Story = StoryObj<ToggleMaskedComponent>;

export const DEFAULT: Story = {
  name: 'Default',
  args: {
    config: {
      mask: '******',
      translations: {
        [CommonTranslationKeys.Common_ToggleMasked_Status_Masked]: 'Masked',
        [CommonTranslationKeys.Common_ToggleMasked_Status_Unmasked]: 'Unmasked',
        [CommonTranslationKeys.Common_ToggleMasked_Action_Mask]: 'Mask',
        [CommonTranslationKeys.Common_ToggleMasked_Action_Unmask]: 'Unmask',
      },
    },
    data: {
      code: '123456',
      label: 'TestLabel',
    },
  },
};
