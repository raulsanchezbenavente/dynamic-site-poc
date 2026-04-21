import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { JOURNEYS_BC_FAKE } from '../../../../../../stories/mocks/booking-fake/journeys-bc.fake';
import { STORYBOOK_PROVIDERS } from '../../../../../providers/storybook.providers';
import { FaresOptionsComponent } from '../fares-options.component';
import { TranslationKeys } from '../../../enums/translation-keys.enum';
import { CommonTranslationKeys } from '@dcx/ui/libs';

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
        [TranslationKeys.Schedule_Fares_Title_Vertical]: 'Elige cómo quieres volar',
        [CommonTranslationKeys.Common_Select_FareTypeName_BASIC]: 'Basic (mock)',
        [CommonTranslationKeys.Common_Select_FareType_Subtitle_BASIC]: 'The Basic essentials (mock)',
        [CommonTranslationKeys.Common_Select_FareTypeName_CLASSIC]: 'Classic (mock)',
        [CommonTranslationKeys.Common_Select_FareType_Subtitle_CLASSIC]: 'The Classic essentials (mock)',
        [CommonTranslationKeys.Common_Select_FareTypeName_FLEX]: 'Flexible (mock)',
        [CommonTranslationKeys.Common_Select_FareType_Subtitle_FLEX]: 'The Flex essentials (mock)',
        [CommonTranslationKeys.Common_Select_RecommendedBadge_Text]: 'Recommended (mock)',
        [TranslationKeys.Fare_Chargeable_IconLabel]: 'Tiene costo adicional',
        [TranslationKeys.Fare_NotIncluded_IconLabel]: 'No incluido (mock)',
        [TranslationKeys.Fare_Included_IconLabel]: 'Incluido (mock)',
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
