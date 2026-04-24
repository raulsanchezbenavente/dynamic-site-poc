import { Strict } from '../../../../abstract/types/rf-base-reactive-exact.type';
import { RfPrefixPhoneHintMessages } from '../../../rf-prefix-phone/models/rf-prefix-phone-hint-messages.model';
import { RfSelectDatePickerHintMessages } from '../../../rf-select-date-picker/models/rf-select-date-picker-hint-messages.model';

export type RfHintMessages =
  | Strict<string>
  | Strict<RfSelectDatePickerHintMessages>
  | Strict<RfPrefixPhoneHintMessages>;
