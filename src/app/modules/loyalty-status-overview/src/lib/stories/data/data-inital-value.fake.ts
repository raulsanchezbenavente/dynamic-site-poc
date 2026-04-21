import type { LoyaltyStatusOverviewConfig } from '../../models/loyalty-status-overview.config';

export const DATA_INITIAL_VALUE: LoyaltyStatusOverviewConfig = {
  culture: 'en-US',
  title: 'Discover the benefits of being elite',
  description: 'Reach one of the elite statuses by accumulating qualifying miles with avianca and our partners.',
  loyaltyStatus: [
    {
      id: 3,
      cardImage: {
        src: 'assets/imgs/payment-methods/silver.png',
        altText: 'Silver Tier',
      },
      tierName: 'Silver',
      benefits: {
        items: [
          {
            content: 'Discount on LifeMiles+',
            icon: {
              name: 'lifemiles',
              ariaAttributes: { ariaLabel: 'LifeMiles icon' },
            },
          },
          {
            content: '10% extra miles on base fare (Not applicable for Basic and Light).',
            icon: {
              name: 'promo',
              ariaAttributes: { ariaLabel: 'promo icon' },
            },
          },
          {
            content: '1 ticket to avianca lounges',
            icon: {
              name: 'standardclass-transport',
              ariaAttributes: { ariaLabel: 'star icon' },
            },
          },
          {
            content: '5% discount on carry-on baggage(10kg)',
            icon: {
              name: 'baggage',
              ariaAttributes: { ariaLabel: 'baggage icon' },
            },
          },
          {
            content: 'Upgrades to Business Class',
            icon: {
              name: 'cross',
              ariaAttributes: { ariaLabel: 'cross icon' },
            },
          },
          {
            content: 'Premium seat selection',
            icon: {
              name: 'cross',
              ariaAttributes: { ariaLabel: 'cross icon' },
            },
          },
          {
            content: 'Additional hold baggage',
            icon: {
              name: 'cross',
              ariaAttributes: { ariaLabel: 'cross icon' },
            },
          },
          {
            content: 'Priority approach',
            icon: {
              name: 'cross',
              ariaAttributes: { ariaLabel: 'cross icon' },
            },
          },
        ],
      },
    },
    {
      id: 4,
      cardImage: {
        src: 'assets/imgs/payment-methods/gold.png',
        altText: 'Gold Tier',
      },
      tierName: 'Gold',
      benefits: {
        items: [
          {
            content: 'Discount on LifeMiles+',
            icon: {
              name: 'lifemiles',
              ariaAttributes: { ariaLabel: 'LifeMiles icon' },
            },
          },
          {
            content: '30% extra miles on base fare (Not applicable for Basic and Light).',
            icon: {
              name: 'promo',
              ariaAttributes: { ariaLabel: 'promo icon' },
            },
          },
          {
            content: '5 ticket to avianca lounges',
            icon: {
              name: 'standardclass-transport',
              ariaAttributes: { ariaLabel: 'star icon' },
            },
          },
          {
            content: '10% discount on carry-on baggage(10kg)',
            icon: {
              name: 'baggage',
              ariaAttributes: { ariaLabel: 'baggage icon' },
            },
          },
          {
            content: '2 upgrades to Business Class',
            icon: {
              name: 'seat-airplane',
              ariaAttributes: { ariaLabel: 'seat icon' },
            },
          },
          {
            content: '2 premium seat selections',
            icon: {
              name: 'seat-airplane',
              ariaAttributes: { ariaLabel: 'seat icon' },
            },
          },
          {
            content: 'Priority approach in group B',
            icon: {
              name: 'standardclass-transport',
              ariaAttributes: { ariaLabel: 'star icon' },
            },
          },
          {
            content: 'Additional hold baggage',
            icon: {
              name: 'cross',
              ariaAttributes: { ariaLabel: 'cross icon' },
            },
          },
        ],
      },
    },
  ],
  discover: {
    icon: {
      name: 'passenger-first',
    },
    title: 'Discover all benefits',
    description:
      'Enjoy all the benefits of being an Elite member on your flights with Avianca and Star Alliance member airlines.',
    buttonLabel: 'See more benefits',
  },
};
