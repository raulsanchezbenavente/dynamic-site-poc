import { BaseClasses } from '../../../abstract/models/rf-base-clases.model';
import { RfBaseReactiveClasses } from '../../../abstract/models/rf-base-reactive-classes.model';
import { Exact } from '../../../abstract/types/rf-base-reactive-exact.type';
import { RfDatepickerClasses } from '../../rf-datepicker/models/rf-datepicker-classes.model';

export interface RfInputDatepickerClasses extends Exact<RfBaseReactiveClasses, BaseClasses> {
  button?: string;
  calendar?: RfDatepickerClasses;
}
