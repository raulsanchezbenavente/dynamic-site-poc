import { ResourcesProductScopeType } from '../enums/resources-product-scope-type.enum';
import { ResourcesServiceType } from '../enums/resources-service-type.enum';

export interface ResourcesService {
  code: string;
  type: ResourcesServiceType;
  limitPerPax: number;
  sellType: ResourcesProductScopeType;
}
