/* eslint-disable @typescript-eslint/naming-convention */
import { AccountClient, AccountFacade, CmsConfigClient, LoyaltyProgramsFacade } from '@dcx/module/api-clients';
import { AuthService } from '@dcx/ui/libs';
import type { DialogModalsRepositoryModel, LinkModel } from '@dcx/ui/libs';
import { StorybookAuthServiceMock } from '@dcx/ui/storybook-session';
import { moduleMetadata } from '@storybook/angular';
import type { Meta, StoryObj } from '@storybook/angular';
import { of } from 'rxjs';
import type { Observable } from 'rxjs';

import { AUTH_BUTTON_MENU_FAKE_OPTIONS } from '../../../../stories/mocks';
import type { CustomerAccount, LoyaltyAccountData } from '../../../models';
import { STORYBOOK_PROVIDERS } from '../../../providers/storybook.providers';
import { CustomerLoyaltyService } from '../../../services/loyalty/customer-loyalty.service';
import { AuthButtonComponent } from '../auth-button.component';
import { AuthButtonLayout } from '../enums/auth-button-layout.enum';
import type { AuthButtonData } from '../models/auth-button-data.model';

const mockCustomerAccount: CustomerAccount = {
  username: 'victormorenogomez',
  firstName: 'Victor',
  lastName: '',
  balance: {
    lifemiles: {
      amount: 9828365,
    },
  },
  customerPrograms: {
    lifemiles: {
      programNumber: 'LM001',
      tier: 'Gold',
    },
  },
  eliteProgress: {
    status: 'gold',
    miles: 9828365,
  },
};

const mockDeleteResponse = {
  succeeded: true,
} as unknown;

const AccountClientMock: Pick<AccountClient, 'sessionDELETE'> = {
  sessionDELETE: () => of(mockDeleteResponse) as ReturnType<AccountClient['sessionDELETE']>,
};

function buildCustomerAccountWithTierCode(tierCode: string, tierName: string): CustomerAccount {
  return {
    ...mockCustomerAccount,
    customerPrograms: {
      lifemiles: {
        programNumber: '',
        tier: tierName,
      },
    },
    eliteProgress: {
      status: tierCode,
    },
  };
}

/**
 * Creates a mock AccountFacade for Storybook stories.
 */
function createAccountFacadeMock(): {
  provide: typeof AccountFacade;
  useValue: Partial<AccountFacade>;
} {
  return {
    provide: AccountFacade,
    useValue: {
      getSession: (): Observable<CustomerAccount | null> => of(buildCustomerAccountWithTierCode('gold', 'Gold')),
    } as Partial<AccountFacade>,
  };
}

/**
 * Creates a mock CmsConfigClient for Storybook stories
 */
const mockLoyaltyPrograms: {
  items: Array<{ tierCode: string; tierName: string; mainColor: string; darkerColor: string }>;
} = {
  items: [
    { tierCode: 'lifemiles', tierName: 'LifeMiles', mainColor: '#a8006e', darkerColor: '#b50080' },
    { tierCode: 'redplus', tierName: 'Red Plus', mainColor: '#f00', darkerColor: '#7c0005' },
    { tierCode: 'diamond', tierName: 'Diamond', mainColor: '#585f5e', darkerColor: '#232021' },
    { tierCode: 'gold', tierName: 'Gold', mainColor: '#f6c400', darkerColor: '#ca6d2e' },
    { tierCode: 'silver', tierName: 'Silver', mainColor: '#c4c8d5', darkerColor: '#6c6c6c' },
    { tierCode: 'magno', tierName: 'Magno', mainColor: '#1f0b00', darkerColor: '#000000' },
  ],
};

/**
 * Tier data for the ALL_TIERS story, matching the CMS mock above.
 * Used to mock CustomerLoyaltyService.getCustomerProgramData() per component instance.
 */
const TIER_PROGRAMS: LoyaltyAccountData[] = [
  { tierName: 'LifeMiles', loyaltyId: 'LM001', mainColor: '#a8006e', darkerColor: '#b50080' },
  { tierName: 'Red Plus', loyaltyId: 'LM001', mainColor: '#f00', darkerColor: '#7c0005' },
  { tierName: 'Diamond', loyaltyId: 'LM001', mainColor: '#585f5e', darkerColor: '#232021' },
  { tierName: 'Gold', loyaltyId: 'LM001', mainColor: '#f6c400', darkerColor: '#ca6d2e' },
  { tierName: 'Silver', loyaltyId: 'LM001', mainColor: '#c4c8d5', darkerColor: '#6c6c6c' },
  { tierName: 'Magno', loyaltyId: 'LM001', mainColor: '#1f0b00', darkerColor: '#000000' },
];

/**
 * Creates a CustomerLoyaltyService mock that cycles through TIER_PROGRAMS on each call.
 * Each auth-button instance initializes and calls getCustomerProgramData() once,
 * so 5 instances in the template will receive tiers 0→4 in render order.
 */
function createAllTiersLoyaltyServiceMock(): Partial<CustomerLoyaltyService> {
  let callIndex = 0;

  return {
    getCustomerProgramData: () => of(TIER_PROGRAMS[callIndex++ % TIER_PROGRAMS.length]),
    formatLoyaltyBalance: () => '9365',
    formatLoyaltyPoints: () => '9,828,365',
  };
}

const CmsConfigClientMock: Pick<CmsConfigClient, 'loyaltyPrograms'> = {
  loyaltyPrograms: () => of(mockLoyaltyPrograms as unknown) as ReturnType<CmsConfigClient['loyaltyPrograms']>,
};

const META: Meta<AuthButtonComponent> = {
  title: 'Components/Auth Button',
  component: AuthButtonComponent,
  tags: ['autodocs'],
  render: (args) => ({ props: { ...args } }),
  parameters: {
    i18nModules: ['Auth', 'Loyalty'],
    i18n: {
      mock: {
        'Auth.AuthButton.SignIn': 'Sign In',
        'Loyalty.Lifemiles_Miles_Label': 'Miles',
        'Loyalty.Lifemiles_Text': 'LifeMiles',
      },
    },
  },
  decorators: [
    moduleMetadata({
      imports: [AuthButtonComponent],
      providers: [
        ...STORYBOOK_PROVIDERS,
        { provide: CmsConfigClient, useValue: CmsConfigClientMock },
        LoyaltyProgramsFacade,
        CustomerLoyaltyService,
      ],
    }),
  ],
};

export default META;
type Story = StoryObj<AuthButtonComponent>;

const CULTURE = 'en-US';
const CONFIG = { culture: CULTURE };
const DATA: AuthButtonData = {
  redirectUrlAfterLogin: { url: '/after-login' } as LinkModel,
  redirectUrlAfterLogout: { url: '/after-logout' } as LinkModel,
  authenticatedAccountMenuConfig: AUTH_BUTTON_MENU_FAKE_OPTIONS,
  dialogModalsRepository: { modalDialogExceptions: [] } as DialogModalsRepositoryModel,
};

export const NOT_LOGGED: Story = {
  name: 'Not Logged',
  args: { config: CONFIG, data: DATA },
  decorators: [
    moduleMetadata({
      providers: [
        { provide: AuthService, useValue: StorybookAuthServiceMock({ authenticated: false, delayMs: 0 }) },
        createAccountFacadeMock(),
        { provide: AccountClient, useValue: AccountClientMock },
        { provide: CmsConfigClient, useValue: CmsConfigClientMock },
        LoyaltyProgramsFacade,
        CustomerLoyaltyService,
      ],
    }),
  ],
};

export const LOGGED: Story = {
  name: 'Logged',
  args: { config: CONFIG, data: DATA },
  decorators: [
    moduleMetadata({
      providers: [
        { provide: AuthService, useValue: StorybookAuthServiceMock({ authenticated: true, delayMs: 0 }) },
        createAccountFacadeMock(),
        { provide: AccountClient, useValue: AccountClientMock },
        { provide: CmsConfigClient, useValue: CmsConfigClientMock },
        LoyaltyProgramsFacade,
        CustomerLoyaltyService,
      ],
    }),
  ],
};

export const LOGGED_COMPACT: Story = {
  name: 'Logged / Compact Layout',
  args: { config: CONFIG, data: DATA, layout: AuthButtonLayout.COMPACT },
  decorators: LOGGED.decorators,
};

export const LOGGED_CONDENSED: Story = {
  name: 'Logged / Condensed Layout',
  args: { config: CONFIG, data: DATA, layout: AuthButtonLayout.CONDENSED },
  decorators: LOGGED.decorators,
};

export const ALL_TIERS: Story = {
  name: 'Logged / All Tier Variants',
  render: () => ({
    template: `
      <div style="margin-bottom: 24px">
        <h1 style="margin: 0 0 8px 0; font-size: 24px; font-weight: 700;">All Tier Variants</h1>
      </div>
      <div style="display: flex; gap: 40px; align-items: flex-start; flex-wrap: wrap; padding: 32px 0 64px;">
        @for (label of tierLabels; track label) {
          <div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
            <p style="color: #666; font-size: 11px; font-weight: 700; margin: 0; text-transform: uppercase; letter-spacing: 1px;">{{ label }}</p>
            <auth-button [data]="data" [config]="config" />
          </div>
        }
      </div>
    `,
    props: {
      tierLabels: [
        'Tier 1 — LifeMiles',
        'Tier 2 — Red Plus',
        'Tier 3 — Diamond',
        'Tier 4 — Gold',
        'Tier 5 — Silver',
        'Tier 6 — Magno',
      ],
      data: DATA,
      config: CONFIG,
    },
  }),
  decorators: [
    moduleMetadata({
      providers: [
        { provide: AuthService, useValue: StorybookAuthServiceMock({ authenticated: true, delayMs: 0 }) },
        createAccountFacadeMock(),
        { provide: AccountClient, useValue: AccountClientMock },
        { provide: CustomerLoyaltyService, useValue: createAllTiersLoyaltyServiceMock() },
      ],
    }),
  ],
};

export const LOGGED_NO_TIER_DATA: Story = {
  name: 'Logged / No Tier Data',
  args: { config: CONFIG, data: DATA },
  decorators: [
    moduleMetadata({
      providers: [
        { provide: AuthService, useValue: StorybookAuthServiceMock({ authenticated: true, delayMs: 0 }) },
        {
          provide: AccountFacade,
          useValue: {
            getSession: (): Observable<CustomerAccount | null> =>
              of({
                ...mockCustomerAccount,
                customerPrograms: { lifemiles: { programNumber: '', tier: '' } },
                eliteProgress: undefined,
              }),
          } as Partial<AccountFacade>,
        },
        { provide: AccountClient, useValue: AccountClientMock },
        { provide: CmsConfigClient, useValue: CmsConfigClientMock },
        LoyaltyProgramsFacade,
        CustomerLoyaltyService,
      ],
    }),
  ],
};
