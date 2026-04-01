import { AccountServiceSettingsDto } from './account-service-settings-dto.model';

export interface AccountSettingsDto {
  culture: string;
  currency: string;
  defaultDepartureStation: string;
  services?: AccountServiceSettingsDto[];
}
