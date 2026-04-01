import { NgFor } from '@angular/common';
import { TagComponent } from '@dcx/storybook/design-system';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { STORYBOOK_PROVIDERS } from '../../../../stories/providers/storybook.providers';
import type { TagConfig } from '../models/tag.config';

// More on how to set up stories at: https://storybook.js.org/docs/7.0/angular/writing-stories/introduction
const META: Meta<TagComponent> = {
  title: 'Atoms/Tags & Badge/Tag',
  component: TagComponent,
  render: (args) => ({
    props: {
      ...args,
    },
  }),
  decorators: [
    moduleMetadata({
      imports: [TagComponent, NgFor],
      providers: STORYBOOK_PROVIDERS,
    }),
  ],
};

export default META;
type Story = StoryObj<TagComponent>;

const TAG_STACK_STYLES = 'display:flex; gap: 12px; flex-wrap: wrap; align-items: center;';

const FARE_TIER_TAGS: TagConfig[] = [
  {
    text: 'Basic',
    cssClass: 'fare1',
  },
  {
    text: 'Light',
    cssClass: 'fare1',
  },
  {
    text: 'Classic',
    cssClass: 'fare2',
  },
  {
    text: 'Flex',
    cssClass: 'fare3',
  },
  {
    text: 'Business',
    cssClass: 'fare4',
  },
];

export const DEFAULT: Story = {
  name: 'Classic fare',
  args: {
    config: {
      text: 'Classic',
      cssClass: 'fare2',
    } as TagConfig,
  },
};

export const FARE_TIERS: Story = {
  name: 'Fare tiers',
  render: () => ({
    props: {
      fareTierTags: FARE_TIER_TAGS,
    },
    template: `
      <div style="${TAG_STACK_STYLES}">
        <tag *ngFor="let fareTag of fareTierTags" [config]="fareTag"></tag>
      </div>
    `,
  }),
};
