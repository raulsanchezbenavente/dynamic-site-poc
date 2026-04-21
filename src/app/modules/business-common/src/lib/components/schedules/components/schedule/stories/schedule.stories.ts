import { JourneyStatus, JourneyType, PaxTypeCode, TransportType , CommonTranslationKeys } from '@dcx/ui/libs';
import { AVAILABLE_FARES_CLASSIC_FAKE } from '@dcx/ui/mock-repository';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { LEGS_RETURN_SEG_2_BC_FAKE } from '../../../../../../stories/mocks';
import { JOURNEYS_BC_FAKE } from '../../../../../../stories/mocks/booking-fake/journeys-bc.fake';
import { STORYBOOK_PROVIDERS } from '../../../../../providers/storybook.providers';
import { ScheduleComponent } from '../schedule.component';
import { TranslationKeys } from '../../../enums/translation-keys.enum';

// More on how to set up stories at: https://storybook.js.org/docs/7.0/angular/writing-stories/introduction
const META: Meta<ScheduleComponent> = {
  title: 'Components/Journey/Schedules/_Components/Schedule',
  component: ScheduleComponent,
  tags: ['autodocs'],
  render: (args) => ({
    props: {
      ...args,
    },
  }),
  parameters: {
    i18nModules: ['Common', 'Schedule', 'City'],
    i18n: {
      mock: {
        [TranslationKeys.City_GIG]: 'Rio de Janeiro',
        [TranslationKeys.City_PEI]: 'Pereira',
        [CommonTranslationKeys.Common_Carriers_OperatedBy]: 'Operado por',
        [CommonTranslationKeys.Common_Terminal]: 'Terminal',
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
      imports: [ScheduleComponent],
      providers: [STORYBOOK_PROVIDERS],
    }),
  ],
};

export default META;
type Story = StoryObj<ScheduleComponent>;

export const DEPARTURE_JOURNEY: Story = {
  name: 'Outbound',
  args: {
    data: JOURNEYS_BC_FAKE[0],
  },
};

export const RETURN_JOURNEY: Story = {
  name: 'Return',
  args: {
    data: JOURNEYS_BC_FAKE[1],
  },
};

export const DIRECT_JOURNEY: Story = {
  name: 'Direct flight',
  args: {
    data: {
      id: '35303435',
      origin: {
        city: 'Pereira',
        iata: 'PEI',
        terminal: '3S',
        airportName: 'Aeropuerto Internacional Matecaña',
        country: 'Colombia',
      },
      destination: {
        city: 'Rio de Janeiro',
        iata: 'GIG',
        terminal: '2',
        airportName: 'Aeropuerto Internacional de Rio de Janeiro',
        country: 'Brasil',
      },
      schedule: {
        std: new Date('2025-03-27T16:30:00'),
        sta: new Date('2025-03-27T18:20:00'),
        stdutc: new Date('2025-03-27T21:30:00Z'),
        stautc: new Date('2025-03-27T23:20:00Z'),
      },
      duration: '01:50',
      segments: [
        {
          id: '424F477E4749477E3236317E41567E323032352D30332D32397E525432',
          referenceId: 'RT2',
          origin: {
            city: 'Bogotá',
            iata: 'BOG',
            terminal: '1A',
            country: 'Colombia',
          },
          destination: {
            city: 'Rio de Janeiro',
            iata: 'GIG',
            terminal: '2',
            country: 'Brazil',
          },
          schedule: {
            std: new Date('2025-03-27T16:30:00'),
            sta: new Date('2025-03-27T18:20:00'),
            stdutc: new Date('2025-03-27T21:30:00Z'),
            stautc: new Date('2025-03-27T23:20:00Z'),

            atd: new Date('2025-03-27T16:30:00'),
            atdutc: new Date('2025-03-27T21:30:00Z'),
            ata: new Date('2025-03-27T18:20:00'),
            atautc: new Date('2025-03-27T23:20:00Z'),
          },
          duration: '01:50',
          transport: {
            carrier: { code: 'AV', name: 'Avianca', operatingAirlineCode: 'AV' },
            type: TransportType.PLANE,
            number: '261',
            model: 'BOEING7878',
            manufacturer: 'BOEING',
          },
          legs: LEGS_RETURN_SEG_2_BC_FAKE,
          status: JourneyStatus.CONFIRMED,
        },
      ],

      journeyType: JourneyType.RETURN,
      totalPax: [
        { total: 2, type: PaxTypeCode.ADT },
        { total: 2, type: PaxTypeCode.TNG },
        { total: 1, type: PaxTypeCode.CHD },
      ],

      fares: [
        {
          isSelected: true,
          order: 2,
          id: 'fareId2',
          referenceId: '0~T~ ~JM~TOW~1000~~0~1~~X',
          fareBasisCode: 'CLASSIC',
          classOfService: 'T1',
          productClass: 'CLASSIC',
          serviceBundleCode: '',
          availableSeats: 0,
          benefitsList: AVAILABLE_FARES_CLASSIC_FAKE,
          charges: [
            { type: 'Fare', code: 'Fare', amount: 6000, currency: 'COP' },
            { type: 'Fee', code: 'UG', amount: 1040, currency: 'COP' },
            { type: 'Fee', code: 'UL', amount: 4850, currency: 'COP' },
            { type: 'Fee', code: 'GHF', amount: 1250, currency: 'COP' },
          ],
        },
      ],

      checkinInfo: {
        openingCheckInDate: new Date('2025-01-22T18:20:00'),
        closingCheckInDate: new Date('2025-01-24T19:20:00'),
      },
    },
  },
};
