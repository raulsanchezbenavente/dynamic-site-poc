import { type Meta, moduleMetadata, type StoryObj } from '@storybook/angular';

import { STORYBOOK_PROVIDERS } from '../../../../providers/storybook.provider';

import { FormBuilderStoryComponent } from './form-builder-story.component';

// More on how to set up stories at: https://storybook.js.org/docs/angular/writing-stories/introduction
const META: Meta<FormBuilderStoryComponent> = {
  title: 'Main/Reactive Forms/Form & Grid Builders/Form Builder (Custom Template)',
  component: FormBuilderStoryComponent,
  tags: ['autodocs'],
  render: (args) => ({
    props: args,
    template: `<form-builder-story />`,
  }),
  argTypes: {},
  decorators: [
    moduleMetadata({
      imports: [],
      declarations: [],
      providers: [STORYBOOK_PROVIDERS],
    }),
  ],
};

export default META;
type Story = StoryObj<FormBuilderStoryComponent>;

export const DEFAULT: Story = {
  name: 'Default',
  args: {},
};
