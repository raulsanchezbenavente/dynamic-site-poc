import { RfBaseReactiveClasses } from '../../../abstract/models/rf-base-reactive-classes.model';
import { Exact } from '../../../abstract/types/rf-base-reactive-exact.type';
import { RfErrorMessagesClasses } from '../../common/rf-error-messages/models/rf-error-messages.classes.model';
import { RfInputClasses } from '../../rf-input-text/models/rf-input-classes.model';
import { RfSelectClasses } from '../../rf-select/models/rf-select-classes.model';

export interface RfSelectDatePickerClases
  extends Exact<
    RfBaseReactiveClasses,
    {
      container?: string;
      title?: string;
      day?: RfSelectClasses;
      month?: RfSelectClasses;
      year?: RfSelectClasses;
      errorMessages?: RfErrorMessagesClasses;
      hintMessages?: RfInputClasses;
    }
  > {}
