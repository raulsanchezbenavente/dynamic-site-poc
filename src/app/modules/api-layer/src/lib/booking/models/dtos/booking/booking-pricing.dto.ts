import { PricedItem, ProductScopeType } from '../../..';

export interface BookingPricing {
  breakdown: Record<ProductScopeType, PricedItem[]>;
  totalAmount: number;
  balanceDue: number;
  isBalanced: boolean;
  currency: string;
}
