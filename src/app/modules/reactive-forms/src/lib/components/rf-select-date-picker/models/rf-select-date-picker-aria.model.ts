import { RfAriaCollection } from '../../../abstract/models/rf-base-reactive-aria.model';
import { Exact } from '../../../abstract/types/rf-base-reactive-exact.type';

export interface RfSelectDatePickerAria
  extends Exact<
    RfAriaCollection,
    {
      day?: string;
      month?: string;
      year?: string;
    }
  > {}
