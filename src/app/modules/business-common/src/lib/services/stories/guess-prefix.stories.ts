import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { RfPrefixPhoneComponent } from 'reactive-forms';

import { STORYBOOK_PROVIDERS } from '../../providers/storybook.providers';

import { GuessPrefixStoryComponent } from './guess-prefix-story.component';

const META: Meta<GuessPrefixStoryComponent> = {
  title: 'Components/Services/GuessPrefix',
  component: GuessPrefixStoryComponent,
  tags: ['autodocs'],
  render: (args) => ({
    props: args,
    template: `<guess-prefix-story />`,
  }),
  decorators: [
    moduleMetadata({
      imports: [GuessPrefixStoryComponent, RfPrefixPhoneComponent],
      providers: [STORYBOOK_PROVIDERS],
    }),
  ],
};

export default META;
type Story = StoryObj<GuessPrefixStoryComponent>;

export const DEFAULT: Story = {
  name: 'Prefix Phone - Guess Prefix',
};
