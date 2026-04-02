import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { JOURNEYS_BC_FAKE } from '../../../../../../stories/mocks/booking-fake/journeys-bc.fake';
import { STORYBOOK_PROVIDERS } from '../../../../../providers/storybook.providers';
import { SelectionScheduleComponent } from '../selection-schedule.component';

// More on how to set up stories at: https://storybook.js.org/docs/7.0/angular/writing-stories/introduction
const META: Meta<SelectionScheduleComponent> = {
  title: 'Components/Journey/Schedules/Selection Schedule',
  component: SelectionScheduleComponent,
  tags: ['autodocs'],
  render: (args) => ({
    props: {
      ...args,
    },
  }),
  parameters: {
    i18nModules: ['Common', 'Journey', ' City', 'Schedule'],
    i18n: {
      mock: {},
    },
  },
  decorators: [
    moduleMetadata({
      imports: [SelectionScheduleComponent],
      providers: [STORYBOOK_PROVIDERS],
    }),
  ],
};

export default META;
type Story = StoryObj<SelectionScheduleComponent>;

export const DEFAULT: Story = {
  name: 'Default',
  args: {
    data: JOURNEYS_BC_FAKE[0],
  },
};
