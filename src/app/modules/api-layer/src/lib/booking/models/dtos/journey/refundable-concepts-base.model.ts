import { PricedItem } from '../../..';

export interface RefundableConceptsBase {
  amount: number;
  conceptList: PricedItem[];
}
