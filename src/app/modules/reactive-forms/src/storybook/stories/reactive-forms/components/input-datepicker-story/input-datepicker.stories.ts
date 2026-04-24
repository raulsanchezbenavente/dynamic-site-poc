import { type Meta, moduleMetadata, type StoryObj } from '@storybook/angular';

import { RfInputDatepickerComponent } from '../../../../../lib/components/rf-input-datepicker/rf-input-datepicker.component';
import { STORYBOOK_PROVIDERS } from '../../../../providers/storybook.provider';

import { InputDatepickerStoryComponent } from './input-datepicker-story.component';

const META: Meta<RfInputDatepickerComponent> = {
  title: 'Main/Reactive Forms/Form Fields/Date Pickers/RfInputDatepicker',
  component: RfInputDatepickerComponent,
  tags: ['autodocs'],
  render: (args) => ({
    props: args,
    template: `<input-datepicker-story />`,
  }),
  argTypes: {},
  decorators: [
    moduleMetadata({
      imports: [InputDatepickerStoryComponent, RfInputDatepickerComponent],
      declarations: [],
      providers: [STORYBOOK_PROVIDERS],
    }),
  ],
};

export default META;
export type Story = StoryObj<InputDatepickerStoryComponent>;

export const DEFAULT: Story = {
  name: 'Default',
  args: {},
};
