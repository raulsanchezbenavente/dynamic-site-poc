import { HeaderMenuItem, Lang } from '../models/main-header.models';

export const LANGS: Lang[] = [
  { code: 'en', label: 'HEADER.EN' },
  { code: 'es', label: 'HEADER.ES' },
  { code: 'fr', label: 'HEADER.FR' },
  { code: 'pt', label: 'HEADER.PT' },
];

export const DEFAULT_MENU: HeaderMenuItem[] = [
  { label: 'HEADER.MENU_HOME' },
  { label: 'HEADER.MENU_PERSONAL_DATA', pageId: '1', tabsId: '111', tabId: '22' },
  { label: 'HEADER.MENU_MY_TRIPS', pageId: '1', tabsId: '111', tabId: '33' },
  { label: 'HEADER.MENU_ACCOUNT_SETTINGS', pageId: '1', tabsId: '111', tabId: '44' },
  { label: 'HEADER.MENU_MY_ELITE_STATUS', pageId: '1', tabsId: '111', tabId: '55' },
  { label: 'HEADER.MENU_BOOK_LM' },
];
