import { BookingModels } from '@dcx/module/api-clients';

import { BoardingPassFormatType } from '../../../enums';

export interface ProcessBoardingPassRequest {
  formatType: BoardingPassFormatType;
  sellKey: string;
  boardingPassDto: BookingModels.BoardingPassDto[];
}
