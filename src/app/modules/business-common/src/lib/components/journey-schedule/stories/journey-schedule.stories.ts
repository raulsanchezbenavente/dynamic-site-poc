import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { JOURNEYS_BC_FAKE } from '../../../../stories/mocks';
import { STORYBOOK_PROVIDERS } from '../../../providers/storybook.providers';
import { CarriersDisplayMode } from '../../schedules';
import { JourneyScheduleComponent } from '../journey-schedule.component';
import { TranslationKeys } from '../enums/translation-keys.enum';
import { CommonTranslationKeys } from '@dcx/ui/libs';

const META: Meta<JourneyScheduleComponent> = {
  title: 'Components/Journey/Schedules/Journey Schedule',
  component: JourneyScheduleComponent,
  tags: ['autodocs'],
  render: (args) => ({
    props: {
      ...args,
    },
  }),
  parameters: {
    i18nModules: ['Common', 'Journey', ' City', 'Schedule'],
    i18n: {
      mock: {
        [TranslationKeys.City_BOG]: 'Bogotá',
        [TranslationKeys.City_GIG]: 'Rio de Janeiro',
        [TranslationKeys.City_MDE]: 'Medellín',
        [TranslationKeys.City_PEI]: 'Pereira',
        [CommonTranslationKeys.Common_Carriers_OperatedBy]: 'Operado por',
        [CommonTranslationKeys.Common_Terminal]: 'Terminal',
        [CommonTranslationKeys.Common_To]: 'a',
        [TranslationKeys.Journey_Status_Confirmed]: 'Confirmado',
        [TranslationKeys.Journey_Status_Delayed]: 'Retrasado',
        [TranslationKeys.Journey_Status_Cancelled]: 'Cancelado',
        [TranslationKeys.Schedule_Connection_StopLabel]: 'Stop:',
        [TranslationKeys.Schedule_Connection_Title]: 'Detalles del vuelo',
        [TranslationKeys.Schedule_Direct]: 'Direct',
        [TranslationKeys.Schedule_ExtraDay_AccessibleLabel]: 'Llegada {{count}} después',
        [TranslationKeys.Schedule_ExtraDay_Day_Label]: 'day',
        [TranslationKeys.Schedule_ExtraDay_Days_Label]: 'day',
        [TranslationKeys.Schedule_Stop]: 'stop',
        [TranslationKeys.Schedule_Stops]: 'stops',
        [TranslationKeys.Schedule_Total_TravelTime_Label]: 'Total travel time:',
        [TranslationKeys.Schedule_PreviousTimeOfDeparture_Label]: 'Hora de salida originalmente programada',
        [TranslationKeys.Schedule_PreviousTimeOfArrival_Label]: 'Hora de llegada originalmente programada',
        [TranslationKeys.Schedule_NewTimeOfDeparture_Label]: 'Nuevo horario de salida',
        [TranslationKeys.Schedule_NewTimeOfArrival_Label]: 'Nuevo horario de llegada',
        [TranslationKeys.Schedule_ExtraDay_Arrival_NextDay]: 'Llegada al día siguiente',
        [TranslationKeys.Schedule_ExtraDay_Arrival_NDaysLater]: 'Llega {{count}} días después',
      },
    },
  },
  decorators: [
    moduleMetadata({
      imports: [JourneyScheduleComponent],
      providers: [STORYBOOK_PROVIDERS],
    }),
  ],
};

export default META;
type Story = StoryObj<JourneyScheduleComponent>;

export const DEPARTURE_JOURNEY: Story = {
  name: 'Outbound',
  args: {
    config: {
      scheduleConfig: {
        carriersDisplayMode: CarriersDisplayMode.OPERATED_BY,
      },
    },
    data: JOURNEYS_BC_FAKE[0],
  },
};

export const RETURN_JOURNEY: Story = {
  name: 'Return',
  args: {
    config: {
      scheduleConfig: {
        carriersDisplayMode: CarriersDisplayMode.OPERATED_BY,
      },
    },
    data: JOURNEYS_BC_FAKE[1],
  },
};
