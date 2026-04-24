import { PricingProductScopeType } from '../enums/pricing-product-scope-type.enum';

import { ServiceAvailabilityDto } from './service-availability.dto';
import { ServiceInfoDto } from './service-info.dto';

export interface ServiceDto {
  id: string;
  referenceId: string;
  info: ServiceInfoDto;
  availability: ServiceAvailabilityDto[];
  sellType: PricingProductScopeType;
}
