import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

import { IProcessBoardingPass, ProcessBoardingPassRequest } from '..';
import { BoardingPassFormatType } from '../../../enums';

import { BoardingPassBaseStrategy } from './boarding-pass-base-strategy';

@Injectable({ providedIn: 'root' })
export class ProcessBoardingPassAppleWalletService extends BoardingPassBaseStrategy implements IProcessBoardingPass {
  public readonly type = BoardingPassFormatType.APPLE_WALLET;

  constructor() {
    super();
  }

  public execute(request: ProcessBoardingPassRequest): Observable<void> {
    const boardingPassData = request.boardingPassDto.find((dto) => dto.sellKey === request.sellKey);

    if (boardingPassData?.boardingPass) {
      this.handleAnchor(boardingPassData.boardingPass, '');
    }

    return of(void 0);
  }
}
