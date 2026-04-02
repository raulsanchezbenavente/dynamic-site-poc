
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { JOURNEYS_BC_FAKE } from '../../../../stories/mocks';
import { STORYBOOK_PROVIDERS } from '../../../providers/storybook.providers';
import { JourneySelectionComponent } from '../journey-selection.component';

// More on how to set up stories at: https://storybook.js.org/docs/7.0/angular/writing-stories/introduction
const META: Meta<JourneySelectionComponent> = {
  title: 'Components/Journey/Journey Selection',
  component: JourneySelectionComponent,
  tags: ['autodocs'],
  render: (args) => ({
    props: {
      ...args,
    },
  }),
  parameters: {
    i18nModules: ['Common', 'Schedule', 'Fare'],
    i18n: {
      api: false,
      mock: {
        'City.BOG': 'Bogotá (mock)',

        'Schedule.Fares.Title_Vertical': 'Elige cómo quieres volar',
        'Schedule.Stop': 'stop (mock)',
        'Schedule.Stops': 'stops (mock)',
        'Schedule.Connection_StopLabel': 'connection stop (mock)',
        'Schedule.ExtraDay.Days_Label': 'day (mock)',
        'Fare.Chargeable_IconLabel': 'Tiene costo adicional',
        'Fare.NotIncluded_IconLabel': 'No incluido (mock)',
        'Fare.Included_IconLabel': 'Incluido (mock)',

        'Common.ShortLabel_Hours': 'h (mock)',
        'Common.From': 'From (mock)',
        'Common.Select_FareTypeName_BASIC': 'Basic (mock)',
        'Common.Select_FareType_Subtitle_BASIC': 'The Basic essentials (mock)',
        'Common.Select_FareTypeName_CLASSIC': 'Classic (mock)',
        'Common.Select_FareType_Subtitle_CLASSIC': 'The Classic essentials (mock)',
        'Common.Select_FareTypeName_FLEX': 'Flexible (mock)',
        'Common.Select_FareType_Subtitle_FLEX': 'The Flex essentials (mock)',
        'Common.Select_RecommendedBadge_Text': 'Recommended (mock)',
      },
    },
  },
  decorators: [
    moduleMetadata({
      imports: [JourneySelectionComponent],
      providers: [STORYBOOK_PROVIDERS],
    }),
  ],
};

export default META;
type Story = StoryObj<JourneySelectionComponent>;

export const DEFAULT: Story = {
  name: 'Default',
  args: {
    data: {
      journey: JOURNEYS_BC_FAKE[0],
      translations: {},
    },
  },
};
