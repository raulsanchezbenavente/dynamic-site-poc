import { RefundableConceptsBase } from '../../..';

export interface RefundableConcepts {
  refundedItems: RefundableConceptsBase;
  nonRefundedItems: RefundableConceptsBase;
  cancellationFeeItems: RefundableConceptsBase;
  totalAmount: number;
}
