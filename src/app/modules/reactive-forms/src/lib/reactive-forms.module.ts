import { NgModule } from '@angular/core';

import { RfCheckboxGroupComponent } from './components/common/rf-checkbox-group/rf-checkbox-group.component';
import { RfDropComponent } from './components/common/rf-drop/rf-drop.component';
import { RfGenericDropButtonComponent } from './components/common/rf-generic-drop-button/rf-generic-drop-button.component';
import { RfRadioGroupComponent } from './components/common/rf-radio-group/rf-radio-group.component';
import { RfCheckboxComponent } from './components/rf-checkbox/rf-checkbox.component';
import { RfDatepickerComponent } from './components/rf-datepicker/rf-datepicker.component';
import { RfInputDatepickerComponent } from './components/rf-input-datepicker/rf-input-datepicker.component';
import { RfInputTextComponent } from './components/rf-input-text/rf-input-text.component';
import { RfIpInputComponent } from './components/rf-ip-input/rf-ip-input.component';
import { RfListComponent } from './components/rf-list/rf-list.component';
import { RfPrefixPhoneComponent } from './components/rf-prefix-phone/rf-prefix-phone.component';
import { RfRadioComponent } from './components/rf-radio/rf-radio.component';
import { RfSelectDatePickerComponent } from './components/rf-select-date-picker/rf-select-date-picker.component';
import { RfSelectComponent } from './components/rf-select/rf-select.component';
import { RfSwitchComponent } from './components/rf-switch/rf-switch.component';
import { RfFormBuilderComponent } from './form-builder/rf-form-builder/rf-form-builder.component';
import { GridBuilderComponent } from './tools/grid-builder/grid-builder.component';

@NgModule({
  imports: [
    RfDropComponent,
    RfInputTextComponent,
    RfRadioComponent,
    RfCheckboxComponent,
    RfSwitchComponent,
    RfListComponent,
    RfSelectComponent,
    RfIpInputComponent,
    RfPrefixPhoneComponent,
    RfGenericDropButtonComponent,
    RfSelectDatePickerComponent,
    RfDatepickerComponent,
    RfInputDatepickerComponent,
    RfRadioGroupComponent,
    RfCheckboxGroupComponent,
    RfFormBuilderComponent,
    GridBuilderComponent,
  ],
  exports: [
    RfDropComponent,
    RfInputTextComponent,
    RfRadioComponent,
    RfCheckboxComponent,
    RfSwitchComponent,
    RfListComponent,
    RfSelectComponent,
    RfIpInputComponent,
    RfPrefixPhoneComponent,
    RfGenericDropButtonComponent,
    RfSelectDatePickerComponent,
    RfDatepickerComponent,
    RfInputDatepickerComponent,
    RfRadioGroupComponent,
    RfCheckboxGroupComponent,
    RfFormBuilderComponent,
    GridBuilderComponent,
  ],
})
export class RfReactiveFormsModule {}
