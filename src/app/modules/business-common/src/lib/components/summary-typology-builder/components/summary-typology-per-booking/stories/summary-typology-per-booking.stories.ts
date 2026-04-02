import { JOURNEYS_FAKE } from '@dcx/ui/mock-repository';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { SUMMARY_CART_TRANSLATIONS_BC } from '../../../../../../stories/mocks/translations/summary-cart-translations-bc.fake';
import { STORYBOOK_PROVIDERS } from '../../../../../providers/storybook.providers';
import { PassengerTypesComponent } from '../../../../passenger-types';
import { SummaryTypologyPerBookingComponent } from '../summary-typology-per-booking.component';
import { PriceBreakdownItemComponent, PriceBreakdownItemsComponent, PriceBreakdownHeaderComponent, PriceCurrencyComponent, PriceBreakdownComponent } from '@dcx/storybook/design-system';
import { SummaryTypologyTemplate, PaxTypeCode } from '@dcx/ui/libs';

// More on how to set up stories at: https://storybook.js.org/docs/7.0/angular/writing-stories/introduction
const META: Meta<SummaryTypologyPerBookingComponent> = {
  title: 'Components/Summary Typology/Per Booking',
  component: SummaryTypologyPerBookingComponent,
  tags: ['autodocs'],
  render: (args) => ({
    props: {
      ...args,
    },
  }),
  decorators: [
    moduleMetadata({
      imports: [
        SummaryTypologyPerBookingComponent,
        PassengerTypesComponent,
        PriceBreakdownItemComponent,
        PriceBreakdownItemsComponent,
        PriceBreakdownHeaderComponent,
        PriceCurrencyComponent,
        PriceBreakdownComponent,
      ],
      providers: [STORYBOOK_PROVIDERS],
    }),
  ],
};

export default META;
type Story = StoryObj<SummaryTypologyPerBookingComponent>;

const CALCULATE_HEADER_PRICE = (list: any[]) => {
  return list.reduce((total, item) => {
    const ITEM_PRICE = item.item.price * (item.item.quantity || 1);
    const SUBITEMS_PRICE = item.subitems?.reduce(
      (subTotal: number, subitem: { price: number; quantity: any }) =>
        subTotal + subitem.price * (subitem.quantity || 1),
      0
    );
    return total + ITEM_PRICE + SUBITEMS_PRICE;
  }, 0);
};

const PRICE_BREAKDOWN_LIST = [
  { item: { quantity: 1, code: 'MUSI', price: 100, currency: 'EUR' }, subitems: [] },
  {
    item: { quantity: 2, code: 'SKIS', price: 100, currency: 'EUR' },
    subitems: [{ quantity: 2, code: 'code', price: 200, currency: 'COP' }],
  },
  { item: { quantity: 2, code: 'SCUB', price: 1440, currency: 'EUR' }, subitems: [] },
  { item: { quantity: 1, code: 'WUDP.s', price: 340, currency: 'EUR' }, subitems: [] },
  { item: { quantity: 1, code: 'ZQAD.s', price: 40, currency: 'EUR' }, subitems: [] },
];

export const DEFAULT: Story = {
  name: 'Default',
  args: {
    summaryTypologyConfig: {
      showInfoForSelectedFlight: false,
      voucherMask: 'Voucher',
      useTypologyItem: true,
      translations: {
        ...SUMMARY_CART_TRANSLATIONS_BC,
      },
      showPaxGroup: true,
      useStaticDetails: true,
      isCollapsible: true,
      bookingSellTypeServices: [],
      displayPriceItemConcepts: true,
      summaryScopeView: SummaryTypologyTemplate.PER_BOOKING,
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
        journeys: JOURNEYS_FAKE,
        payments: [],
        contacts: [],
        services: [],
        pricing: {
          totalAmount: 0,
          balanceDue: 0,
          isBalanced: true,
          currency: 'currency',
          breakdown: {
            perBooking: [
              {
                referenceId: 'referenceId',
                sellKey: 'sellKey',
                totalAmount: 1000,
                currency: 'COP',
                charges: [],
              },
            ],
            perPax: [],
            perPaxSegment: [],
            perSegment: [],
            perPaxJourney: [
              {
                paxId: 'paxId',
                journeyId: '7E7E7E7E7E7E',
                referenceId: '7E7E7E7E7E7E',
                sellKey: 'sellKey',
                totalAmount: 1000,
                currency: 'COP',
                charges: [],
              },
            ],
          },
        },
      },
    },
    priceBreakdownModel: {
      config: [
        {
          header: {
            isCollapsed: true,
            config: {
              label: 'Ver detalle',
              // secondLabel: 'Price breakdown',
              price: CALCULATE_HEADER_PRICE(PRICE_BREAKDOWN_LIST),
              currency: 'EUR',
              isCollapsible: true,
              ariaAttributes: {
                ariaLabel: 'Price breakdown',
                ariaControls: 'price-breakdown-header',
              },
            },
          },
          list: PRICE_BREAKDOWN_LIST,
          accessibilityConfig: {
            id: 'price-breakdown1',
          },
        },
      ],
    },
  },
};
