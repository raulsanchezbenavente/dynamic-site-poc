import { Exact } from '../../../abstract/types/rf-base-reactive-exact.type';
import {
  RfErrorMessageMultipleComponent,
  RfErrorMessageSingleComponent,
} from '../../common/rf-error-messages/models/rf-error-messages.model';

export interface RfIpErrorMessages
  extends Exact<
    RfErrorMessageMultipleComponent,
    {
      ip1: RfErrorMessageSingleComponent;
      ip2: RfErrorMessageSingleComponent;
      ip3: RfErrorMessageSingleComponent;
      ip4: RfErrorMessageSingleComponent;
    }
  > {}
