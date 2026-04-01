import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from "@storybook/angular";
import { PnrComponent } from "@dcx/storybook/design-system";

// More on how to set up stories at: https://storybook.js.org/docs/7.0/angular/writing-stories/introduction
const meta: Meta<PnrComponent> = {
  title: 'Molecules/Pnr',
  component: PnrComponent,
  tags: ['autodocs'],
  render: (args) => ({
    props: {
      ...args,
    },
  }),
  argTypes: {},
    decorators: [moduleMetadata({ imports: [PnrComponent], providers: [] })]
};

export default meta;
type Story = StoryObj<PnrComponent>;

export const DEFAULT: Story = {
  name: 'Default',
  args: {
    config: {
      label: 'Booking reference',
      code: 'NS7777',
    },
  },
};
