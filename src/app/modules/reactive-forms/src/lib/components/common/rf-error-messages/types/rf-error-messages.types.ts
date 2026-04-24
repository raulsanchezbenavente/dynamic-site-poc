import { Strict } from '../../../../abstract/types/rf-base-reactive-exact.type';
import { RfIpErrorMessages } from '../../../rf-ip-input/models/rf-ip-input-error-messages.model';
import { RfPrefixPhoneErrorMessages } from '../../../rf-prefix-phone/models/rf-prefix-phone-error-messages.model';
import { RfErrorMessageMultipleComponent, RfErrorMessageSingleComponent } from '../models/rf-error-messages.model';

export type RfErrorMessages =
  | Strict<RfErrorMessageSingleComponent>
  | Strict<RfErrorMessageMultipleComponent>
  | Strict<RfIpErrorMessages>
  | Strict<RfPrefixPhoneErrorMessages>;
