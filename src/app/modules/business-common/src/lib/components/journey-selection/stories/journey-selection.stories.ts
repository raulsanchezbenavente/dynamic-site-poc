import { CommonTranslationKeys } from '@dcx/ui/libs';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { JOURNEYS_BC_FAKE } from '../../../../stories/mocks';
import { STORYBOOK_PROVIDERS } from '../../../providers/storybook.providers';
import { TranslationKeys } from '../enums/translation-keys.enum';
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
        [TranslationKeys.City_BOG]: 'Bogotá (mock)',

        [TranslationKeys.Schedule_Fares_Title_Vertical]: 'Elige cómo quieres volar',
        [TranslationKeys.Schedule_Stop]: 'stop (mock)',
        [TranslationKeys.Schedule_Stops]: 'stops (mock)',
        [TranslationKeys.Schedule_Connection_StopLabel]: 'connection stop (mock)',
        [TranslationKeys.Schedule_ExtraDay_Days_Label]: 'day (mock)',
        [TranslationKeys.Fare_Chargeable_IconLabel]: 'Tiene costo adicional',
        [TranslationKeys.Fare_NotIncluded_IconLabel]: 'No incluido (mock)',
        [TranslationKeys.Fare_Included_IconLabel]: 'Incluido (mock)',

        [CommonTranslationKeys.Common_ShortLabel_Hours]: 'h (mock)',
        [CommonTranslationKeys.Common_From]: 'From (mock)',
        [CommonTranslationKeys.Common_Select_FareTypeName_BASIC]: 'Basic (mock)',
        [CommonTranslationKeys.Common_Select_FareType_Subtitle_BASIC]: 'The Basic essentials (mock)',
        [CommonTranslationKeys.Common_Select_FareTypeName_CLASSIC]: 'Classic (mock)',
        [CommonTranslationKeys.Common_Select_FareType_Subtitle_CLASSIC]: 'The Classic essentials (mock)',
        [CommonTranslationKeys.Common_Select_FareTypeName_FLEX]: 'Flexible (mock)',
        [CommonTranslationKeys.Common_Select_FareType_Subtitle_FLEX]: 'The Flex essentials (mock)',
        [CommonTranslationKeys.Common_Select_RecommendedBadge_Text]: 'Recommended (mock)',
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
    },
  },
};
