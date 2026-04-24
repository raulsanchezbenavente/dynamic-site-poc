import { BaseClasses } from '../../../abstract/models/rf-base-clases.model';
import { RfBaseReactiveClasses } from '../../../abstract/models/rf-base-reactive-classes.model';
import { Exact } from '../../../abstract/types/rf-base-reactive-exact.type';

export interface RfDatepickerClasses extends Exact<RfBaseReactiveClasses, BaseClasses> {
  calendar?: string;
}
