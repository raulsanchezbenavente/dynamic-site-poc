import { ValidatorFn } from '@angular/forms';

import { RfValidatorsMultiple } from '../../abstract/models/rf-base-reactive-valdators.model';
import { RfIpinputValidators } from '../../components/rf-ip-input/models/rf-ip-input-validators.model';
import { RfPrefixPhoneValidators } from '../../components/rf-prefix-phone/models/rf-prefix-phone-validators.model';
import { RfSelectDatePickerValidators } from '../../components/rf-select-date-picker/models/rf-select-date-picker-validators.model';

export type RfValidator =
  | ValidatorFn[]
  | RfValidatorsMultiple
  | RfIpinputValidators
  | RfPrefixPhoneValidators
  | RfSelectDatePickerValidators;
