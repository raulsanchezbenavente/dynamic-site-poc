import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { BoardingPassProxyService, IProcessBoardingPass, ProcessBoardingPassRequest } from '..';
import { BoardingPassFormatType } from '../../../enums';

import { BoardingPassBaseStrategy } from './boarding-pass-base-strategy';

@Injectable({ providedIn: 'root' })
export class ProcessBoardingPassPdfService extends BoardingPassBaseStrategy implements IProcessBoardingPass {
  public readonly type = BoardingPassFormatType.PDF;

  private readonly boardingPassProxyService = inject(BoardingPassProxyService);

  constructor() {
    super();
  }

  public execute(request: ProcessBoardingPassRequest): Observable<void> {
    const httpOptions = {
      responseType: 'blob' as const,
    };

    const boardingPassData = request.boardingPassDto[0]?.boardingPass;

    if (!boardingPassData) {
      return new Observable<void>((observer) => {
        observer.error(new Error('Boarding pass data not found'));
      });
    }

    return new Observable<void>((observer) => {
      this.boardingPassProxyService.getBlobPartFile(boardingPassData, httpOptions).subscribe({
        next: (blob) => {
          this.saveToDevice(
            new Blob([blob], {
              type: 'application/pdf',
            })
          );
          observer.next();
          observer.complete();
        },
        error: (err) => {
          observer.error(new Error(err));
        },
      });
    });
  }

  private saveToDevice(data: Blob): void {
    const fileName = 'boarding-pass.pdf';
    const fileUrl = globalThis.URL.createObjectURL(data);
    if (globalThis.navigator && (globalThis.navigator as any).msSaveOrOpenBlob) {
      (globalThis.navigator as any).msSaveOrOpenBlob(data, fileName);
    } else {
      this.handleAnchor(fileUrl, fileName);
    }
    globalThis.URL.revokeObjectURL(fileUrl);
  }
}
