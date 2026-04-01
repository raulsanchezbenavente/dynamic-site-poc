import { OrganizationInfoDto } from './organization-info.dto';

export interface AgencyInfoDto {
  name: string;
  code: string;
  organizationInfo: OrganizationInfoDto;
}
