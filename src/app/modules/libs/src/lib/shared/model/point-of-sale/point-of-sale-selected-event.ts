import { IbeEventTypeEnum } from '../../../core';

import { PointOfSaleVm } from './point-of-sale-vm';

export interface PointOfSaleSelectedEvent {
  type: IbeEventTypeEnum.pointOfSaleSelectedEvent;
  pointOfSale: PointOfSaleVm;
  userInteractWithPOSSelectorFlag: boolean;
}
