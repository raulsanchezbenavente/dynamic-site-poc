import { RfBaseReactiveClasses } from '../../../abstract/models/rf-base-reactive-classes.model';
import { Exact } from '../../../abstract/types/rf-base-reactive-exact.type';
import { RfErrorMessagesClasses } from '../../common/rf-error-messages/models/rf-error-messages.classes.model';

export interface RfListClasses
  extends Exact<
    RfBaseReactiveClasses,
    {
      container?: string;
      drop?: string;
      filter?: string;
      option?: string;
      errorMessages?: RfErrorMessagesClasses;
      hintMessages?: RfErrorMessagesClasses;
    }
  > {}
