import { AccountFacade } from '@dcx/module/api-clients';
import { MODULE_TRANSLATION_MAP } from '@dcx/module/translation';
import type { CustomerAccount } from '@dcx/ui/business-common';
import { applicationConfig } from '@storybook/angular';
import { type Meta, type StoryObj } from '@storybook/angular';
import { Observable, throwError } from 'rxjs';

import { LoyaltyOverviewCardComponent } from '../loyalty-overview-card.component';

import { AccountClientFake } from './mocks/account-client.fake';

/**
 * Creates a mock AccountFacade for different loyalty tiers
 */
function createAccountFacadeMock(tier: string): {
  provide: typeof AccountFacade;
  useValue: { getSession: () => Observable<CustomerAccount> };
} {
  const fakeClient = new AccountClientFake();
  return {
    provide: AccountFacade,
    useValue: {
      getSession: (): Observable<CustomerAccount> => {
        return new Observable<CustomerAccount>((observer) => {
          fakeClient.sessionGET(tier).subscribe((response) => {
            observer.next(response.result?.data as CustomerAccount);
            observer.complete();
          });
        });
      },
    },
  };
}

/**
 * Creates a mock AccountFacade that throws an error to simulate API failure
 */
function createAccountFacadeErrorMock(): {
  provide: typeof AccountFacade;
  useValue: { getSession: () => Observable<never> };
} {
  return {
    provide: AccountFacade,
    useValue: {
      getSession: (): Observable<never> => {
        return throwError(() => ({
          status: 500,
          message: 'API Error - Session data unavailable',
          response: JSON.stringify({ error: { code: 'SESSION_ERROR' } }),
        }));
      },
    },
  };
}

const META: Meta<LoyaltyOverviewCardComponent> = {
  title: 'Main/Loyalty Overview Card',
  component: LoyaltyOverviewCardComponent,
  parameters: {
    i18nModules: MODULE_TRANSLATION_MAP['LoyaltyOverviewCard'],
    i18n: {
      mock: {
        'Loyalty.OverviewCard.Greeting_Text': 'Hello, {{name}}',
        'Loyalty.OverviewCard.Title': 'Lifemiles account information overview',
        'Loyalty.OverviewCard.CopyLoyaltyNumber': 'Copy Lifemiles number to clipboard',
        'Loyalty.OverviewCard.CopyLoyaltyNumberSuccess': 'Lifemiles number copied',
        'Loyalty.OverviewCard.CopyLoyaltyNumberSuccess_Text': 'Lifemiles number copied to your clipboard',
        'Loyalty.OverviewCard.TotalMiles_Text': 'Total miles',
        'Loyalty.OverviewCard.ExpirationDate_Text': 'Expiration date',
        'Loyalty.OverviewCard.NoExpirationDate_Text': 'There is no expiration date.',
        'Loyalty.OverviewCard.Loading': 'Loading...',
        'Loyalty.OverviewCard.Error.Title': 'ERROR',
        'Loyalty.OverviewCard.Exception': 'There was an exception',
        'Loyalty.OverviewCard.Copy_Icon': 'Copy',
        'Loyalty.Lifemiles_Text': 'Lifemiles',
        'Loyalty.Lifemiles_Miles_Label': 'Miles',
        'Loyalty.LifemilesNumber_Text': 'Lifemiles Number',
        'Common.OK': 'OK',
        'Loyalty.Tiers.Lifemiles': 'Lifemiles',
        'Loyalty.Tiers.RedPlus': 'Red Plus',
        'Loyalty.Tiers.Diamond': 'Diamond',
        'Loyalty.Tiers.Gold': 'Gold',
        'Loyalty.Tiers.Silver': 'Silver',
      },
    },
  },
};

export default META;
type Story = StoryObj<LoyaltyOverviewCardComponent>;

// More on writing stories with args: https://storybook.js.org/docs/angular/writing-stories/args
export const TIER_1_LIFEMILES: Story = {
  name: 'Tier 1 - Lifemiles (default)',
  decorators: [
    applicationConfig({
      providers: [createAccountFacadeMock('Lifemiles')],
    }),
  ],
};

export const TIER_2_REDPLUS: Story = {
  name: 'Tier 2 - Red Plus',
  decorators: [
    applicationConfig({
      providers: [createAccountFacadeMock('Red Plus')],
    }),
  ],
};

export const TIER_3_DIAMOND: Story = {
  name: 'Tier 3 - Diamond',
  decorators: [
    applicationConfig({
      providers: [createAccountFacadeMock('Diamond')],
    }),
  ],
};

export const TIER_4_GOLD: Story = {
  name: 'Tier 4 - Gold',
  decorators: [
    applicationConfig({
      providers: [createAccountFacadeMock('Gold')],
    }),
  ],
};

export const TIER_5_SILVER: Story = {
  name: 'Tier 5 - Silver',
  decorators: [
    applicationConfig({
      providers: [createAccountFacadeMock('Silver')],
    }),
  ],
};

export const APIERROR_FALLBACK: Story = {
  name: 'API Error - Fallback Data',
  decorators: [
    applicationConfig({
      providers: [createAccountFacadeErrorMock()],
    }),
  ],
};
