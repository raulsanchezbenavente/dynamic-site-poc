import { ButtonConfig } from '../../button';
import { OptionsListConfig } from '../../options-list/options-list.model';
import { DropdownVM } from '../dropdown.model';

export interface DropdownListConfig {
  dropdownModel: DropdownVM;
  optionsListConfig: OptionsListConfig;
  applyButtonConfig?: ButtonConfig;
}
