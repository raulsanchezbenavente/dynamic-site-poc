import { BoardingPassFormatType } from '../../../enums';

export interface DownloadBoardingPassRequest {
  paxId: string;
  journeyId: string;
  formatType: BoardingPassFormatType;
}
