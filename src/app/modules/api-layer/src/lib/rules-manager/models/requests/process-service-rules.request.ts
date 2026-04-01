import { ServiceInformation } from '../dtos/service-information.dto';
import { ServicesAdditionalData } from '../dtos/services-additional-data.dto';

export interface ProcessServiceRulesRequest {
  services: ServiceInformation[];
  data: ServicesAdditionalData;
}
