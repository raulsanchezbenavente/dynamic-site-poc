import { AppLang } from '../../../../services/site-config/models/langs.model';

export type HeaderMenuItem = {
  label: string;
  checked?: boolean;
  external?: boolean;
  redirectTo?: string;
  pageId?: string;
  tabsId?: string;
  tabId?: string;
};

export type Lang = { code: AppLang; label: string };
