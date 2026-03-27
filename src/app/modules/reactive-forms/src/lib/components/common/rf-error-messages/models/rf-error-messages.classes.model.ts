import { RfBaseReactiveClasses } from '../../../../abstract/models/rf-base-reactive-classes.model';
import { Exact } from '../../../../abstract/types/rf-base-reactive-exact.type';

export interface RfErrorMessagesClasses
  extends Exact<
    RfBaseReactiveClasses,
    {
      message?: string;
    }
  > {}
