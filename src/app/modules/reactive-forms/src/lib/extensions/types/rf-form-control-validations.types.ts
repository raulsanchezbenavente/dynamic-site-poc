import { ValidatorFn } from '@angular/forms';

import { RfBaseReactiveComponent } from '../../abstract/components/rf-base-reactive.component';
import { RfValidatorsMultiple } from '../../abstract/models/rf-base-reactive-valdators.model';
import { RfCheckboxComponent } from '../../components/rf-checkbox/rf-checkbox.component';
import { RfDatepickerComponent } from '../../components/rf-datepicker/rf-datepicker.component';
import { RfInputDatepickerComponent } from '../../components/rf-input-datepicker/rf-input-datepicker.component';
import { RfInputTextComponent } from '../../components/rf-input-text/rf-input-text.component';
import { RfListComponent } from '../../components/rf-list/rf-list.component';
import { RfPrefixPhoneComponent } from '../../components/rf-prefix-phone/rf-prefix-phone.component';
import { RfRadioComponent } from '../../components/rf-radio/rf-radio.component';
import { RfSelectDatePickerComponent } from '../../components/rf-select-date-picker/rf-select-date-picker.component';
import { RfSelectComponent } from '../../components/rf-select/rf-select.component';
import { RfSwitchComponent } from '../../components/rf-switch/rf-switch.component';

export type RfValidatorsConfig = ValidatorFn | ValidatorFn[] | RfValidatorsMultiple | null;

export type RfComponentTypes =
  | RfBaseReactiveComponent
  | RfInputTextComponent
  | RfRadioComponent
  | RfCheckboxComponent
  | RfSwitchComponent
  | RfListComponent
  | RfSelectComponent
  | RfPrefixPhoneComponent
  | RfDatepickerComponent
  | RfInputDatepickerComponent
  | RfSelectDatePickerComponent;
