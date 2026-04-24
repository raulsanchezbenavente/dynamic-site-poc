import { type Meta, moduleMetadata, type StoryObj } from '@storybook/angular';

import { RfListComponent } from '../../../../../lib/components/rf-list/rf-list.component';
import { STORYBOOK_PROVIDERS } from '../../../../providers/storybook.provider';

import { ListStoryComponent } from './list-story.component';

const META: Meta<RfListComponent> = {
  title: 'Main/Reactive Forms/Form Fields/RfList',
  component: RfListComponent,
  tags: ['autodocs'],
  render: (args) => ({
    props: args,
    template: `<list-story />`,
  }),
  argTypes: {},
  decorators: [
    moduleMetadata({
      imports: [ListStoryComponent, RfListComponent],
      declarations: [],
      providers: [STORYBOOK_PROVIDERS],
    }),
  ],
};

export default META;
export type Story = StoryObj<ListStoryComponent>;

export const DEFAULT: Story = {
  name: 'Default',
  args: {},
};
