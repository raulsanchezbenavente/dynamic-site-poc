/* eslint-disable @typescript-eslint/no-empty-object-type */
import { Exact } from '../../../abstract/types/rf-base-reactive-exact.type';
import {
  RfErrorMessageMultipleComponent,
  RfErrorMessageSingleComponent,
} from '../../common/rf-error-messages/models/rf-error-messages.model';

export interface RfPrefixPhoneErrorMessages
  extends Exact<
    RfErrorMessageMultipleComponent,
    {
      prefix?: RfErrorMessageSingleComponent;
      phone?: RfErrorMessageSingleComponent;
    }
  > {}
