import { type Meta, moduleMetadata, type StoryObj } from '@storybook/angular';

import { RfDatepickerComponent } from '../../../../../lib/components/rf-datepicker/rf-datepicker.component';
import { STORYBOOK_PROVIDERS } from '../../../../providers/storybook.provider';

import { DatepickerStoryComponent } from './datepicker-story.component';

const META: Meta<RfDatepickerComponent> = {
  title: 'Main/Reactive Forms/Form Fields/Date Pickers/RfDatepicker',
  component: RfDatepickerComponent,
  tags: ['autodocs'],
  render: (args) => ({
    props: args,
    template: `<datepicker-story />`,
  }),
  argTypes: {},
  decorators: [
    moduleMetadata({
      imports: [DatepickerStoryComponent, RfDatepickerComponent],
      declarations: [],
      providers: [STORYBOOK_PROVIDERS],
    }),
  ],
};

export default META;
export type Story = StoryObj<DatepickerStoryComponent>;

export const DEFAULT: Story = {
  name: 'Default',
  args: {},
};
