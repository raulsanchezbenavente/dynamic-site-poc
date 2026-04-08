import { CmsConfigClient, LoyaltyProgramsFacade } from '@dcx/module/api-clients';
import { CustomerLoyaltyService } from '@dcx/ui/business-common';
import {
  AuthService,
  ComposerService,
  ConfigService,
  CurrencyService,
  EXCLUDE_SESSION_EXPIRED_URLS,
  KeycloakAuthService,
  LoggerService,
  NotificationService,
  RedirectService,
  TIMEOUT_REDIRECT,
} from '@dcx/ui/libs';
import { CurrencyServiceFake, LoggerServiceFake, RedirectServiceFake } from '@dcx/ui/mock-repository';
import { KeycloakService } from 'keycloak-angular';
import { of } from 'rxjs';

// eslint-disable-next-line no-restricted-imports
import { LoyaltyPrograms } from '../../../../../api-clients/src/lib/models/cmsConfig/cmsConfig-models';
import { ConfigServiceFake } from '../../stories/mocks/config.service.fake';

// eslint-disable-next-line @typescript-eslint/naming-convention
const CmsConfigClientMock: Pick<CmsConfigClient, 'loyaltyPrograms'> = {
  loyaltyPrograms: () => of(mockLoyaltyPrograms),
};

const mockLoyaltyPrograms: LoyaltyPrograms = LoyaltyPrograms.fromJS({
  items: [
    { tierName: 'Lifemiles', mainColor: '#f00', darkerColor: '#b50080' },
    { tierName: 'Red Plus', mainColor: '#f00', darkerColor: '#7c0005' },
    { tierName: 'Diamond', mainColor: '#585f5e', darkerColor: '#232021' },
    { tierName: 'Gold', mainColor: '#f6c400', darkerColor: '#ca6d2e' },
    { tierName: 'Silver', mainColor: '#c4c8d5', darkerColor: '#6c6c6c' },
  ],
});

export const STORYBOOK_PROVIDERS = [
  ComposerService,
  KeycloakService,
  KeycloakAuthService,
  NotificationService,
  { provide: CmsConfigClient, useValue: CmsConfigClientMock },
  LoyaltyProgramsFacade,
  CustomerLoyaltyService,
  {
    provide: ConfigService,
    useClass: ConfigServiceFake,
  },
  {
    provide: LoggerService,
    useClass: LoggerServiceFake,
  },
  {
    provide: CurrencyService,
    useClass: CurrencyServiceFake,
  },
  {
    provide: RedirectService,
    useClass: RedirectServiceFake,
  },
  {
    provide: TIMEOUT_REDIRECT,
    useValue: '/',
  },
  {
    provide: EXCLUDE_SESSION_EXPIRED_URLS,
    useValue: [],
  },
  {
    provide: AuthService,
    useValue: {
      isAuthenticatedKeycloak$: () => of(true),
    } as AuthService,
  },
];
