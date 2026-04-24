import { type Meta, moduleMetadata, type StoryObj } from '@storybook/angular';

import { DATA_INITIAL_VALUE } from '../../../stories/data/data-inital-value.fake';
import { STORYBOOK_PROVIDERS } from '../../../stories/providers/storybook.providers';
import { SecondaryNavComponents } from '../enums/secondary-nav-components.enum';
import { SecondaryNavComponent } from '../secondary-nav.component';

// More on how to set up stories at: https://storybook.js.org/docs/angular/writing-stories/introduction
const META: Meta<SecondaryNavComponent> = {
  title: 'Molecules/Secondary Nav',
  component: SecondaryNavComponent,
  tags: ['autodocs'],
  render: (args) => ({
    props: {
      ...args,
    },
  }),
  decorators: [
    moduleMetadata({
      imports: [],
      providers: STORYBOOK_PROVIDERS,
    }),
  ],
};

export default META;
type Story = StoryObj<SecondaryNavComponent>;

export const DEFAULT: Story = {
  name: 'Default',
  args: {
    secondaryNavOptions: {
      availableComponents: [SecondaryNavComponents.LANGUAGE_SELECTOR, SecondaryNavComponents.POINT_OF_SALE_SELECTOR],
      config: {
        languageSelectorListConfig: DATA_INITIAL_VALUE.languageSelectorListConfig,
        culture: 'en-US',
      },
    },
  },
};
