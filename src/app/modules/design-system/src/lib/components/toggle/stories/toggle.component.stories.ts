import { ToggleComponent } from '@dcx/storybook/design-system';

import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { STORYBOOK_PROVIDERS } from '../../../../stories/providers/storybook.providers';

// More on how to set up stories at: https://storybook.js.org/docs/7.0/angular/writing-stories/introduction
const meta: Meta<ToggleComponent> = {
  title: 'Atoms/Toggle/Toggle',
  component: ToggleComponent,
  tags: ['autodocs'],
  render: (args) => ({
    props: {
      ...args,
    },
  }),
  decorators: [
    moduleMetadata({
      imports: [ToggleComponent],
      providers: STORYBOOK_PROVIDERS,
    }),
  ],
};

export default meta;
type Story = StoryObj<ToggleComponent>;

export const DEFAULT: Story = {
  name: 'Default',
  args: {
    config: {
      isChecked: false,
      isDisabled: false,
      isReadOnly: false,
      offLabel: 'Off',
      onLabel: 'On',
      title: 'Toggle',
    },
  },
};
