import { Exact } from '../../../abstract/types/rf-base-reactive-exact.type';
import {
  RfErrorMessageMultipleComponent,
  RfErrorMessageSingleComponent,
} from '../../common/rf-error-messages/models/rf-error-messages.model';

export interface RfSelectDatePickerErrorMessages
  extends Exact<
    RfErrorMessageMultipleComponent,
    {
      day?: RfErrorMessageSingleComponent;
      month?: RfErrorMessageSingleComponent;
      year?: RfErrorMessageSingleComponent;
    }
  > {}
