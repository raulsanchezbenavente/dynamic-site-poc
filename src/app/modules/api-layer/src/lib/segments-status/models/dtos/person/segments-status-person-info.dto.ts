import { SegmentsStatusGenderType } from '../enums/segments-status-gender-type.enum';
import { SegmentsStatusWeightType } from '../enums/segments-status-weight-type.enum';

export interface SegmentsStatusPersonInfo {
  gender: SegmentsStatusGenderType;
  weight: SegmentsStatusWeightType;
  dateOfBirth: Date;
  nationality: string;
}
