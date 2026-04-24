import { Injectable } from "@angular/core";
import { LoyaltyStatusOverviewBuilderInterface } from "../interfaces/loyalty-status-overview-builder.interface";
import { LoyaltyStatusOverviewVM } from "../models/loyalty-status-overview-vm.model";

@Injectable()
export class LoyaltyStatusOverviewBuilderService implements LoyaltyStatusOverviewBuilderInterface {
  public getData(): LoyaltyStatusOverviewVM {
    return {
      current: { 
        title: 'Your current status',
        tier: {
          id: 3,
          tierName: 'Silver',
          cardImage: {
            src: 'assets/imgs/payment-methods/silver.png',
            altText: 'Current Silver Tier'
          },
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
                isDisabled: true
              },
              {
                content: 'Premium seat selection',
                icon: {
                  name: 'cross',
                  ariaAttributes: { ariaLabel: 'cross icon' },
                },
                isDisabled: true
              },
              {
                content: 'Additional hold baggage',
                icon: {
                  name: 'cross',
                  ariaAttributes: { ariaLabel: 'cross icon' },
                },
                isDisabled: true
              },
              {
                content: 'Priority approach',
                icon: {
                  name: 'cross',
                  ariaAttributes: { ariaLabel: 'cross icon' },
                },
                isDisabled: true
              }
            ]
          }
        },
        milesRequired: 6000,
        minMilesWithAvianca: 1000,
      },
      next: {
        title: 'Your next status',
        tier: {
          id: 4,
          cardImage: {
            src: 'assets/imgs/payment-methods/gold.png',
            altText: 'Next Gold Tier'
          },
          tierName: 'Gold',
          benefits: {
            items: [
              {
                content: 'Discount on LifeMiles+',
                icon: {
                  name: 'lifemiles',
                  ariaAttributes: { ariaLabel: 'LifeMiles icon' },
                }
              },
              {
                content: '30% extra miles on base fare (Not applicable for Basic and Light).',
                icon: {
                  name: 'promo',
                  ariaAttributes: { ariaLabel: 'promo icon' },
                }
              },
              {
                content: '5 ticket to avianca lounges',
                icon: {
                  name: 'standardclass-transport',
                  ariaAttributes: { ariaLabel: 'star icon' },
                }
              },
              {
                content: '10% discount on carry-on baggage(10kg)',
                icon: {
                  name: 'baggage',
                  ariaAttributes: { ariaLabel: 'baggage icon' },
                }
              },
              {
                content: '2 upgrades to Business Class',
                icon: {
                  name: 'seat-airplane',
                  ariaAttributes: { ariaLabel: 'seat icon' },
                }
              },
              {
                content: '2 premium seat selections',
                icon: {
                  name: 'seat-airplane',
                  ariaAttributes: { ariaLabel: 'seat icon' },
                }
              },
              {
                content: 'Priority approach in group B',
                icon: {
                  name: 'standardclass-transport',
                  ariaAttributes: { ariaLabel: 'star icon' },
                }
              },
              {
                content: 'Additional hold baggage',
                icon: {
                  name: 'cross',
                  ariaAttributes: { ariaLabel: 'cross icon' },
                },
                isDisabled: true
              }
            ]
          }
        },
        milesRequired: 12000,
        minMilesWithAvianca: 6000,
      }
    }
  }
}