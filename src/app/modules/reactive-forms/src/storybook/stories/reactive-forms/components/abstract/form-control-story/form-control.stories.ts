import { type Meta, moduleMetadata, type StoryObj } from '@storybook/angular';

import { STORYBOOK_PROVIDERS } from '../../../../../providers/storybook.provider';

import { FormControlFakeComponent } from './form-control-dummy.component';
import { FormControlStoryComponent } from './form-control-story.component';

// More on how to set up stories at: https://storybook.js.org/docs/angular/writing-stories/introduction
const META: Meta<FormControlFakeComponent> = {
  title: 'Main/Reactive Forms/Form Fields/Abstract/RfFormControl',
  component: FormControlFakeComponent,
  tags: ['autodocs'],
  render: (args) => ({
    props: args,
    template: `<form-control-story />`,
  }),
  decorators: [
    moduleMetadata({
      imports: [FormControlStoryComponent],
      declarations: [],
      providers: [STORYBOOK_PROVIDERS],
    }),
  ],
};

export default META;
type Story = StoryObj<FormControlStoryComponent>;

// More on writing stories with args: https://storybook.js.org/docs/angular/writing-stories/args
export const DEFAULT: Story = {
  name: 'Default',
  args: {},
};
