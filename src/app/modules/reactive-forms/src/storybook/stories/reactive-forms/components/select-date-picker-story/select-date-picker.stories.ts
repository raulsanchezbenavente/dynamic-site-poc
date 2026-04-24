import { type Meta, moduleMetadata, type StoryObj } from '@storybook/angular';

import { RfSelectDatePickerComponent } from '../../../../../public-api';
import { STORYBOOK_PROVIDERS } from '../../../../providers/storybook.provider';

import { SelectDatePickerStoryComponent } from './select-date-picker-story.component';

// More on how to set up stories at: https://storybook.js.org/docs/angular/writing-stories/introduction
const META: Meta<RfSelectDatePickerComponent> = {
  title: 'Main/Reactive Forms/Form Fields/Date Pickers/RfSelectDatePicker',
  component: RfSelectDatePickerComponent,
  tags: ['autodocs'],
  render: (args) => ({
    props: args,
    template: `<select-date-picker-story />`,
  }),
  argTypes: {},
  decorators: [
    moduleMetadata({
      imports: [SelectDatePickerStoryComponent],
      providers: STORYBOOK_PROVIDERS,
    }),
  ],
};

export default META;
type Story = StoryObj<SelectDatePickerStoryComponent>;

// More on writing stories with args: https://storybook.js.org/docs/angular/writing-stories/args
export const DEFAULT: Story = {
  name: 'Default',
  args: {},
};
