import { Strict } from '../../abstract/types/rf-base-reactive-exact.type';
import { RfInputClasses } from '../../components/rf-input-text/models/rf-input-classes.model';
import { RfIpInputClasses } from '../../components/rf-ip-input/models/rf-ip-input-classes.model';
import { RfListClasses } from '../../components/rf-list/models/rf-list-classes.model';
import { RfPrefixPhoneClases } from '../../components/rf-prefix-phone/models/rf-prefix-phone-classes.model';
import { RfSelectDatePickerClases } from '../../components/rf-select-date-picker/models/rf-select-date-picker-classes.model';
import { RfSelectClasses } from '../../components/rf-select/models/rf-select-classes.model';
import { RfDatePickerField, RfInputDatePickerField } from '../models/rf-form-builder.model';

export type RfClasses =
  // Strict<BaseReactiveClasses> |
  | Strict<RfInputClasses>
  | Strict<RfListClasses>
  | Strict<RfSelectClasses>
  | Strict<RfIpInputClasses>
  | Strict<RfPrefixPhoneClases>
  | Strict<RfSelectDatePickerClases>
  | Strict<RfInputDatePickerField>
  | Strict<RfDatePickerField>;
