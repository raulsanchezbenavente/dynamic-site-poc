import { RfErrorDisplayModes } from '../../abstract/enums/rf-base-reactive-display-mode.enum';

export interface RfFormBuilderValue {
  value?: any;
  disabled: boolean;
  touched: boolean;
  dirty: boolean;
  displayErrorsMode: RfErrorDisplayModes;
}
