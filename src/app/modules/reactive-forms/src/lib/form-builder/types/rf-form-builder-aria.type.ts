import { Strict } from '../../abstract/types/rf-base-reactive-exact.type';
import { RfIpAria } from '../../components/rf-ip-input/models/rf-ip-input-aria.model';
import { RfPrefixPhoneAria } from '../../components/rf-prefix-phone/models/rf-prefix-phone-aria.model';
import { RfSelectDatePickerAria } from '../../components/rf-select-date-picker/models/rf-select-date-picker-aria.model';

export type RfAria =
  | string
  // Strict<RfAriaCollection> |
  | Strict<RfIpAria>
  | Strict<RfPrefixPhoneAria>
  | Strict<RfSelectDatePickerAria>;
