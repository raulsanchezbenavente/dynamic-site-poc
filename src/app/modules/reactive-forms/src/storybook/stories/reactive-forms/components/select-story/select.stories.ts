import { type Meta, moduleMetadata, type StoryObj } from '@storybook/angular';

import { RfSelectComponent } from '../../../../../lib/components/rf-select/rf-select.component';
import { STORYBOOK_PROVIDERS } from '../../../../providers/storybook.provider';

import { SelectStoryComponent } from './select-story.component';

const META: Meta<RfSelectComponent> = {
  title: 'Main/Reactive Forms/Form Fields/RfSelect',
  component: RfSelectComponent,
  tags: ['autodocs'],
  render: (args) => ({
    props: args,
    template: `<select-story />`,
  }),
  argTypes: {},
  decorators: [
    moduleMetadata({
      imports: [SelectStoryComponent, RfSelectComponent],
      declarations: [],
      providers: [STORYBOOK_PROVIDERS],
    }),
  ],
};

export default META;
export type Story = StoryObj<SelectStoryComponent>;

export const DEFAULT: Story = {
  name: 'Default',
  args: {},
};
