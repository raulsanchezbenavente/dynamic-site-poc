import type { RfErrorMessageSingleComponent } from '../../../../../lib/components/common/rf-error-messages/models/rf-error-messages.model';

export const ERROR_MESSAGES_DATEPICKER: RfErrorMessageSingleComponent = {
  required: 'Date is required',
  invalidDate: 'Invalid date',
  invalidDateRange: 'Invalid date range',
  specificStartDateRange: 'The minimum start date is {{specificStartDateRange}}',
  specificEndDateRange: 'The maximum end date is {{specificEndDateRange}}',
  invalidSpecificDateRange: 'The date must be between {{invalidSpecificDateRange}}',
  invalidSpecificDate: 'The date must be {{invalidSpecificDate}}',
};
