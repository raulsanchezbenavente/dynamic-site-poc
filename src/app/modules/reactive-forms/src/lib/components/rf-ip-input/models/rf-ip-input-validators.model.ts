import { ValidatorFn } from '@angular/forms';

import { RfValidatorsMultiple } from '../../../abstract/models/rf-base-reactive-valdators.model';
import { Exact } from '../../../abstract/types/rf-base-reactive-exact.type';

export interface RfIpinputValidators extends Exact<RfValidatorsMultiple, any> {
  ip: ValidatorFn[];
}
