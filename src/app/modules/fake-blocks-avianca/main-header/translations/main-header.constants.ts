import { HeaderMenuItem, Lang } from '../models/main-header.models';

export const LANGS: Lang[] = [
  { code: 'en', label: 'HEADER.EN' },
  { code: 'es', label: 'HEADER.ES' },
  { code: 'fr', label: 'HEADER.FR' },
  { code: 'pt', label: 'HEADER.PT' },
];

export const DEFAULT_MENU: HeaderMenuItem[] = [
  { label: 'HEADER.MENU_HOME', pageId: '0', external: true },
  { label: 'HEADER.MENU_PERSONAL_DATA', externalTab: true, pageId: '2', tabsId: '111', tabId: '22' },
  { label: 'HEADER.MENU_MY_TRIPS', externalTab: true, pageId: '2', tabsId: '111', tabId: '33' },
  { label: 'HEADER.MENU_ACCOUNT_SETTINGS', externalTab: true, pageId: '2', tabsId: '111', tabId: '44' },
  { label: 'HEADER.MENU_MY_ELITE_STATUS', externalTab: true, pageId: '2', tabsId: '111', tabId: '55' },
  { label: 'HEADER.MENU_BOOK_LM' },
];
