import { RfAriaCollection } from '../../../abstract/models/rf-base-reactive-aria.model';
import { Exact } from '../../../abstract/types/rf-base-reactive-exact.type';

export interface RfIpAria
  extends Exact<
    RfAriaCollection,
    {
      ip1?: string;
      ip2?: string;
      ip3?: string;
      ip4?: string;
    }
  > {}
