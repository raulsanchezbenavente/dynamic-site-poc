import { type Meta, moduleMetadata, type StoryObj } from '@storybook/angular';

import { STORYBOOK_PROVIDERS } from '../../../../../providers/storybook.provider';

import { FormGroupFakeComponent } from './form-group-dummy.component';
import { FormGroupStoryComponent } from './form-group-story.component';

// More on how to set up stories at: https://storybook.js.org/docs/angular/writing-stories/introduction
const META: Meta<FormGroupFakeComponent> = {
  title: 'Main/Reactive Forms/Form Fields/Abstract/RfFormGroup',
  component: FormGroupFakeComponent,
  tags: ['autodocs'],
  render: (args) => ({
    props: args,
    template: `<form-group-story />`,
  }),
  decorators: [
    moduleMetadata({
      imports: [FormGroupStoryComponent],
      declarations: [],
      providers: STORYBOOK_PROVIDERS,
    }),
  ],
};

export default META;
type Story = StoryObj<FormGroupStoryComponent>;

// More on writing stories with args: https://storybook.js.org/docs/angular/writing-stories/args
export const DEFAULT: Story = {
  name: 'Default',
  args: {},
};
