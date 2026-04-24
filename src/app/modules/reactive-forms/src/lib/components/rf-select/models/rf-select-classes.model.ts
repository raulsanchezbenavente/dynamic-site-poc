/* eslint-disable @typescript-eslint/no-empty-object-type */
import { RfBaseReactiveClasses } from '../../../abstract/models/rf-base-reactive-classes.model';
import { Exact } from '../../../abstract/types/rf-base-reactive-exact.type';
import { RfListClasses } from '../../rf-list/models/rf-list-classes.model';

export interface RfSelectClasses
  extends Exact<
    RfBaseReactiveClasses,
    {
      container?: string;
      button?: string;
      containerItemSelected?: string;
      list?: RfListClasses;
    }
  > {}
