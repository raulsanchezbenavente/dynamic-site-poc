import { AppLang } from '@navigation';

export type HeaderMenuItem = {
  label: string;
  checked?: boolean;
  external?: boolean;
  externalTab?: boolean;
  targetBlank?: boolean;
  redirectTo?: string;
  pageId?: string;
  tabsId?: string;
  tabId?: string;
};

export type Lang = { code: AppLang; label: string };
