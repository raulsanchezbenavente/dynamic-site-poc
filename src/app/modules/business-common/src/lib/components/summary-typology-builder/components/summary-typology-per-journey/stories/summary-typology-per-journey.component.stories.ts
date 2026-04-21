import { PriceBreakdownComponent } from '@dcx/ui/design-system';
import { CommonTranslationKeys, PaxTypeCode, SummaryTypologyTemplate } from '@dcx/ui/libs';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { STORYBOOK_PROVIDERS } from '../../../../../providers/storybook.providers';
import { PassengerTypesComponent } from '../../../../passenger-types';
import { TranslationKeys } from '../../../enums/translation-keys.enum';
import { SummaryTypologyPerJourneyComponent } from '../summary-typology-per-journey.component';

// More on how to set up stories at: https://storybook.js.org/docs/7.0/angular/writing-stories/introduction
const meta: Meta<SummaryTypologyPerJourneyComponent> = {
  title: 'Components/Summary Typology/Per Journey',
  component: SummaryTypologyPerJourneyComponent,
  tags: ['autodocs'],
  render: (args) => ({
    props: {
      ...args,
    },
  }),
  decorators: [
    moduleMetadata({
      imports: [SummaryTypologyPerJourneyComponent, PassengerTypesComponent, PriceBreakdownComponent],
      providers: [STORYBOOK_PROVIDERS],
    }),
  ],
};

export default meta;
type Story = StoryObj<SummaryTypologyPerJourneyComponent>;

export const DEFAULT: Story = {
  name: 'Default',
  args: {
    summaryTypologyConfig: {
      showInfoForSelectedFlight: false,
      voucherMask: 'Voucher',
      showPaxGroup: true,
      useTypologyItem: true,
      useStaticDetails: true,
      isCollapsible: true,
      bookingSellTypeServices: ['bookingSellTypeServices'],
      displayPriceItemConcepts: true,
      summaryScopeView: SummaryTypologyTemplate.PER_PAX,
      booking: {
        bookingInfo: {
          recordLocator: 'recordLocator',
          createdDate: 'createdDate',
          status: 'status',
          comments: [],
          queues: [],
          pointOfSale: {
            agent: {
              id: 'id',
            },
            organization: {
              id: 'id',
            },
          },
        },
        pax: [
          {
            type: {
              code: PaxTypeCode.ADT,
            },
            id: 'id',
            name: {
              first: 'firstName',
            },
          },
          {
            type: {
              code: PaxTypeCode.CHD,
            },
            id: 'id',
            name: {
              first: 'firstName',
            },
          },
          {
            type: {
              code: PaxTypeCode.CHD,
            },
            id: 'id',
            name: {
              first: 'firstName',
            },
          },
        ],
        journeys: [],
        payments: [],
        contacts: [],
        services: [],
        pricing: {
          totalAmount: 0,
          balanceDue: 0,
          isBalanced: true,
          currency: 'currency',
          breakdown: {
            perBooking: [],
            perPax: [
              {
                paxId: 'paxId',
                referenceId: 'referenceId',
                sellKey: 'sellKey',
                totalAmount: 0,
                currency: 'currency',
                charges: [],
              },
            ],
            perPaxSegment: [],
            perSegment: [],
            perPaxJourney: [],
          },
        },
      },
    },
  },
};
