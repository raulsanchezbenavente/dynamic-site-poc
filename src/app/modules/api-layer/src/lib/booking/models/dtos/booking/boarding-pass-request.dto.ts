import { BoardingPassFormatType } from '../../requests/enums/boarding-pass-format-type.enum';
import { BoardingPassGroupType } from '../../requests/enums/boarding-pass-group-type.enum';
import { EnumSellType } from '../enums/sell-type.enum';

import { PaxSellKeyItemDto } from './pax-sellkey-item.dto';

export interface BoardingPassRequestDto {
  generation: EnumSellType;
  group: BoardingPassGroupType;
  format: BoardingPassFormatType;
  templateName: string;
  items: PaxSellKeyItemDto[];
}
