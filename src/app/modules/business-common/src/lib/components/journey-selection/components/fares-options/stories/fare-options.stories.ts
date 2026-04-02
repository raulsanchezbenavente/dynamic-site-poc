import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { JOURNEYS_BC_FAKE } from '../../../../../../stories/mocks/booking-fake/journeys-bc.fake';
import { STORYBOOK_PROVIDERS } from '../../../../../providers/storybook.providers';
import { FaresOptionsComponent } from '../fares-options.component';

// More on how to set up stories at: https://storybook.js.org/docs/7.0/angular/writing-stories/introduction
const META: Meta<FaresOptionsComponent> = {
  title: 'Components/Journey/Fare Options',
  component: FaresOptionsComponent,
  tags: ['autodocs'],
  render: (args) => ({
    props: {
      ...args,
    },
  }),
  parameters: {
    i18nModules: ['Common'],
    i18n: {
      mock: {
        'Schedule.Fares.Title_Vertical': 'Elige cómo quieres volar',
        'Common.Select_FareTypeName_BASIC': 'Basic (mock)',
        'Common.Select_FareType_Subtitle_BASIC': 'The Basic essentials (mock)',
        'Common.Select_FareTypeName_CLASSIC': 'Classic (mock)',
        'Common.Select_FareType_Subtitle_CLASSIC': 'The Classic essentials (mock)',
        'Common.Select_FareTypeName_FLEX': 'Flexible (mock)',
        'Common.Select_FareType_Subtitle_FLEX': 'The Flex essentials (mock)',
        'Common.Select_RecommendedBadge_Text': 'Recommended (mock)',
        'Fare.Chargeable_IconLabel': 'Tiene costo adicional',
        'Fare.NotIncluded_IconLabel': 'No incluido (mock)',
        'Fare.Included_IconLabel': 'Incluido (mock)',
      },
    },
  },
  decorators: [
    moduleMetadata({
      imports: [FaresOptionsComponent],
      providers: [STORYBOOK_PROVIDERS],
    }),
  ],
};

export default META;
type Story = StoryObj<FaresOptionsComponent>;

export const DEFAULT: Story = {
  name: 'Default',
  parameters: {},
  args: {
    data: {
      title: 'Elige cómo quieres volar',
      options: JOURNEYS_BC_FAKE[0].fares ?? [],
    },
  },
};
