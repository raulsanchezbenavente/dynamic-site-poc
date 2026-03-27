import { type Meta, moduleMetadata, type StoryObj } from '@storybook/angular';

import { RfBaseReactiveComponent } from '../../../../../../lib/abstract/components/rf-base-reactive.component';
import { STORYBOOK_PROVIDERS } from '../../../../../providers/storybook.provider';

import { AbstractStoryComponent } from './abstract-story.component';

// More on how to set up stories at: https://storybook.js.org/docs/angular/writing-stories/introduction
const META: Meta<RfBaseReactiveComponent> = {
  title: 'Main/Reactive Forms/Form Fields/Abstract/RfAbstract',
  component: RfBaseReactiveComponent,
  tags: ['autodocs'],
  render: (args) => ({
    props: args,
    template: `<abstract-story />`,
  }),
  decorators: [
    moduleMetadata({
      imports: [AbstractStoryComponent],
      providers: [STORYBOOK_PROVIDERS],
    }),
  ],
};

export default META;
type Story = StoryObj<AbstractStoryComponent>;

// More on writing stories with args: https://storybook.js.org/docs/angular/writing-stories/args
export const DEFAULT: Story = {
  name: 'Default',
  args: {},
};
