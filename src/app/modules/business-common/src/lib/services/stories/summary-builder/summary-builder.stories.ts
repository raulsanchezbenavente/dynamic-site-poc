import { type Meta, moduleMetadata, type StoryObj } from '@storybook/angular';
import { GridBuilderComponent, RfFormBuilderComponent } from 'reactive-forms';

import { STORYBOOK_PROVIDERS } from '../../../providers/storybook.providers';

import { SummaryBuilderStoryComponent } from './summary-builder-story.component';

const META: Meta<SummaryBuilderStoryComponent> = {
  title: 'Components/Services/SummaryBuilder',
  component: SummaryBuilderStoryComponent,
  tags: ['autodocs'],
  render: (args) => ({
    props: args,
    template: `<summary-builder-story />`,
  }),
  argTypes: {},
  decorators: [
    moduleMetadata({
      imports: [SummaryBuilderStoryComponent, RfFormBuilderComponent, GridBuilderComponent],
      providers: [STORYBOOK_PROVIDERS],
    }),
  ],
};

export default META;
type Story = StoryObj<SummaryBuilderStoryComponent>;

export const DEFAULT: Story = {
  name: 'Custom Templates',
  args: {},
};
