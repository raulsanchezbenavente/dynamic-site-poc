import { OptionsListComponent } from '@dcx/ui/design-system';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { AUTH_BUTTON_MENU_FAKE_OPTIONS } from '../../../../stories/mocks';
import { STORYBOOK_PROVIDERS } from '../../../providers/storybook.providers';
import { AuthenticatedAccountMenuComponent } from '../authenticated-account-menu.component';
import { SkeletonAuthenticatedAccountMenuComponent } from '../components/skeleton/skeleton-authenticated-account-menu.component';
import { TranslationKeys } from '../enums/translation-keys.enum';

// More on how to set up stories at: https://storybook.js.org/docs/7.0/angular/writing-stories/introduction
const META: Meta<AuthenticatedAccountMenuComponent> = {
  title: 'Components/Authenticated Account Menu',
  component: AuthenticatedAccountMenuComponent,
  tags: ['autodocs'],
  render: (args) => ({
    props: {
      ...args,
    },
  }),
  parameters: {
    i18nModules: ['Auth', 'AuthenticatedAccountMenu'],
    i18n: {
      mock: {
        [TranslationKeys.Auth_AuthButton_SignIn]: 'Sign in (mock)',
        [TranslationKeys.Auth_AuthButton_Welcome]: 'Hello, {0} (mock)',
        [TranslationKeys.Auth_AuthenticatedAccountMenu_Logout]: 'Sign out (mock)',
        [TranslationKeys.Auth_AuthenticatedAccountMenu_AriaLabel]: 'Account menu (mock)',
      },
    },
  },
  decorators: [
    moduleMetadata({
      imports: [AuthenticatedAccountMenuComponent, OptionsListComponent, SkeletonAuthenticatedAccountMenuComponent],
      providers: [STORYBOOK_PROVIDERS],
    }),
  ],
};

export default META;
type Story = StoryObj<AuthenticatedAccountMenuComponent>;

export const DEFAULT: Story = {
  name: 'Default',
  args: {
    config: AUTH_BUTTON_MENU_FAKE_OPTIONS,
  },
};

const ACTIVE_PAGE_MY_TRIPS = {
  ...AUTH_BUTTON_MENU_FAKE_OPTIONS,
  options: AUTH_BUTTON_MENU_FAKE_OPTIONS.options.map((o) => ({
    ...o,
    isSelected: o.link?.url === '/en/members/my-trips/',
  })),
};

export const ACTIVE_ITEM_BY_URL: Story = {
  name: 'Active item by URL path',
  args: {
    config: ACTIVE_PAGE_MY_TRIPS,
  },
};
