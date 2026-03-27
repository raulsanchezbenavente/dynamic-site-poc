/* eslint-disable @typescript-eslint/no-empty-object-type */
import { RfBaseReactiveClasses } from '../../../abstract/models/rf-base-reactive-classes.model';
import { Exact } from '../../../abstract/types/rf-base-reactive-exact.type';
import { RfErrorMessagesClasses } from '../../common/rf-error-messages/models/rf-error-messages.classes.model';

export interface RfRadioClasses
  extends Exact<
    RfBaseReactiveClasses,
    {
      container?: string;
      radio?: string;
      label?: string;
      errorMessages?: RfErrorMessagesClasses;
      hintMessages?: RfErrorMessagesClasses;
    }
  > {}
