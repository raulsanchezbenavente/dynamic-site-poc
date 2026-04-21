import type { AuthAccountMenuOptionsConfig } from '@dcx/storybook/business-common';
import { LinkTarget } from '@dcx/ui/libs';

export const AUTH_BUTTON_MENU_FAKE_OPTIONS: AuthAccountMenuOptionsConfig = {
  culture: 'en-US',
  options: [
    {
      link: {
        url: '/home',
        title: 'Home',
      },
    },
    {
      isSelected: true,
      link: {
        url: '/en/members/my-lifemiles/',
        title: 'My Elite Status',
      },
    },
    {
      link: {
        url: '/en/members/my-trips/',
        title: 'My Trips',
      },
    },
    {
      link: {
        url: '/en/members/my-profile/',
        title: 'My Profile',
      },
    },
    {
      link: {
        url: 'https://google.com',
        title: 'Book flight with miles',
        target: LinkTarget.BLANK,
      },
    },
    {
      link: {
        url: '/en/members/my-preferences/',
        title: 'Account Settings',
      },
    },
  ],
} as AuthAccountMenuOptionsConfig;
