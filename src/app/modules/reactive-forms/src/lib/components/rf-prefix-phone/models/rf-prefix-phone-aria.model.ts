import { RfAriaCollection } from '../../../abstract/models/rf-base-reactive-aria.model';
import { Exact } from '../../../abstract/types/rf-base-reactive-exact.type';

export interface RfPrefixPhoneAria
  extends Exact<
    RfAriaCollection,
    {
      prefix?: string;
      phone?: string;
    }
  > {}
