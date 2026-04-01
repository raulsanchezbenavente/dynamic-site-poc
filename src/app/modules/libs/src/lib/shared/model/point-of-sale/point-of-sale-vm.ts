import { IconConfig } from '../icon';

import { PointOfSale } from './point-of-sale.model';

export interface PointOfSaleVm extends PointOfSale {
  imgSrc?: string;
  icon?: IconConfig;
}
