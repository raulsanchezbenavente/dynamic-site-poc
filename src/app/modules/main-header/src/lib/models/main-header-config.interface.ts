import { AuthButtonData } from '@dcx/ui/business-common';
import { DropdownListConfig } from '@dcx/ui/libs';

import { SecondaryNavComponents } from '../components/secondary-nav/enums/secondary-nav-components.enum';

import { MainHeaderLogo } from './main-header-logo.model';
import { MainMenuItem } from './main-menu-item.model';

export interface MainHeaderConfig {
  authData: AuthButtonData;
  culture: string;
  enableFixedHeaderOnScroll?: boolean;
  enableFixedHeaderOnScrollMobile?: boolean;
  languageSelectorListConfig: DropdownListConfig;
  logo: MainHeaderLogo;
  logoMobile?: MainHeaderLogo;
  mainMenuList: MainMenuItem[];
  mainMenuListMobile: MainMenuItem[];
  secondaryNavAvailableOptions: SecondaryNavComponents[];
  secondaryNavOptionsMobile: SecondaryNavComponents[];
  showAuthButton?: boolean;
  showAuthButtonMobile?: boolean;
}
