import { BoardingPassFormatType } from '../enums/boarding-pass-format-type.enum';
import { BoardingPassGenerationType } from '../enums/boarding-pass-generation-type.enum';
import { BoardingPassGroupType } from '../enums/boarding-pass-group-type.enum';

export interface GenerateBoardingPassRequest {
  tokens: string[];
  templateName: string;
  format: BoardingPassFormatType;
  generation: BoardingPassGenerationType;
  group: BoardingPassGroupType;
  culture: string;
}
