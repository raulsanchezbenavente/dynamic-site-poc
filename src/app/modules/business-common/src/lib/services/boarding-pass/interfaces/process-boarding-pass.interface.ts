import { Observable } from 'rxjs';

import { ProcessBoardingPassRequest } from '..';
import { BoardingPassFormatType } from '../../../enums';

export interface IProcessBoardingPass {
  type: BoardingPassFormatType;
  execute(request: ProcessBoardingPassRequest): Observable<void>;
}
