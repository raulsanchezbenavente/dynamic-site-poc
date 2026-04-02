import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { JOURNEYS_BC_FAKE } from '../../../../stories/mocks';
import { STORYBOOK_PROVIDERS } from '../../../providers/storybook.providers';
import { CarriersDisplayMode } from '../../schedules';
import { JourneyScheduleComponent } from '../journey-schedule.component';

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
        'City.BOG': 'Bogotá',
        'City.GIG': 'Rio de Janeiro',
        'City.MDE': 'Medellín',
        'City.PEI': 'Pereira',
        'Common.Carriers.OperatedBy': 'Operado por',
        'Common.Terminal': 'Terminal',
        'Common.To': 'a',
        'Journey.Status.Confirmed': 'Confirmado',
        'Journey.Status.Delayed': 'Retrasado',
        'Journey.Status.Cancelled': 'Cancelado',
        'Schedule.Connection_StopLabel': 'Stop:',
        'Schedule.Connection_Title': 'Detalles del vuelo',
        'Schedule.Direct': 'Direct',
        'Schedule.ExtraDay_AccessibleLabel': 'Llegada {{count}} después',
        'Schedule.ExtraDay.Day_Label': 'day',
        'Schedule.ExtraDay.Days_Label': 'day',
        'Schedule.Stop': 'stop',
        'Schedule.Stops': 'stops',
        'Schedule.Total_TravelTime_Label': 'Total travel time:',
        'Schedule.PreviousTimeOfDeparture_Label': 'Hora de salida originalmente programada',
        'Schedule.PreviousTimeOfArrival_Label': 'Hora de llegada originalmente programada',
        'Schedule.NewTimeOfDeparture_Label': 'Nuevo horario de salida',
        'Schedule.NewTimeOfArrival_Label': 'Nuevo horario de llegada',
        'Schedule.ExtraDay.Arrival_NextDay': 'Llegada al día siguiente',
        'Schedule.ExtraDay.Arrival_NDaysLater': 'Llega {{count}} días después',
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
