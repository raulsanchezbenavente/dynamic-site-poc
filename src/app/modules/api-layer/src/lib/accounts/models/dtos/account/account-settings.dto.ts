import { AccountSubscriptionDto } from './account-subscription.dto';
import { ServiceSettingsDto } from './service-settings.dto';

export interface AccountSettingsDto {
  culture: string;
  currency: string;
  defaultDepartureCity: string;
  services: Array<ServiceSettingsDto>;
  subscription: AccountSubscriptionDto;
}
