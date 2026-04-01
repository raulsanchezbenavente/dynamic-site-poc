import { EnumServiceType } from '@dcx/ui/libs';

export interface ServicePricingRequest {
  serviceTypes: EnumServiceType[];
  journeyIds: string[];
}
