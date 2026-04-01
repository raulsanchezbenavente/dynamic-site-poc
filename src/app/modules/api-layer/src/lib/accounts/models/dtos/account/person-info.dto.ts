import { GenderType } from '../enums/gender-type.enum';
import { WeightType } from '../enums/weight-type.enum';

export interface PersonInfoDto {
  gender: GenderType;
  weight: WeightType;
  dateOfBirth: Date;
  nationality: string;
}
