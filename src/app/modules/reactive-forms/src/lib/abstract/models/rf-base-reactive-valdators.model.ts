/* eslint-disable @typescript-eslint/no-empty-object-type */
import { ValidatorFn } from '@angular/forms';

export interface RfValidatorsMultiple extends Record<string, ValidatorFn[]> {}
