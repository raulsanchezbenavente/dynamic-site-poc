import { inject, Injectable } from '@angular/core';
import { BookingClient, BookingModels } from '@dcx/module/api-clients';
import { DataEventModel, TRACK_ANALYTICS_ERROR_SERVICE_TOKEN } from '@dcx/ui/business-common';
import { AlertType, CultureServiceEx, LoggerService, NotificationService } from '@dcx/ui/libs';
import { TranslateService } from '@ngx-translate/core';
import { catchError, finalize, map, Observable, switchMap, throwError } from 'rxjs';

import { translationKeys } from '../../components/boarding-pass/translations/translation-keys';
import { BoardingPassFormatType } from '../../enums';
import { GlobalLoaderService } from '../global-loader.service';

import { DownloadBoardingPassRequest, IProcessBoardingPass, ProcessBoardingPassRequest } from '.';

@Injectable({ providedIn: 'root' })
export class DownloadBoardingPassService {
  private readonly bookingClient = inject(BookingClient);
  private readonly cultureServiceEx = inject(CultureServiceEx);
  private readonly globalLoaderService = inject(GlobalLoaderService);
  private readonly loggerService = inject(LoggerService);
  private readonly translationService = inject(TranslateService);
  private readonly notificationService = inject(NotificationService);
  private readonly trackAnalyticsErrorService = inject(TRACK_ANALYTICS_ERROR_SERVICE_TOKEN);

  private proccessBoardingPasses?: ReadonlyArray<IProcessBoardingPass>;
  private boardingPassesBySegment?: BookingModels.BoardingPassDto[];

  public downloadBoardingPassPdf(data: DownloadBoardingPassRequest): void {
    this.globalLoaderService.show();
    this.retrieveBoardingPass(data)
      .pipe(
        switchMap((response) => {
          if (!response?.boardingPasses?.length) {
            throw new Error('No boarding passes found in response');
          }

          return this.processBoardingPass({
            formatType: BoardingPassFormatType.PDF,
            sellKey: data.journeyId,
            boardingPassDto: response.boardingPasses,
          });
        }),
        finalize(() => this.globalLoaderService.hide())
      )
      .subscribe({
        next: () =>
          this.loggerService.info(
            'BoardingPassPreviewComponent',
            `Boarding pass ${BoardingPassFormatType.PDF} processed successfully`
          ),
        error: (error) => {
          this.handleDownloadBoardingPassError();
          this.loggerService.error(
            'BoardingPassPreviewComponent',
            `Error downloading boarding pass ${BoardingPassFormatType.PDF}`,
            error
          );
          this.trackAnalyticsError(error, this.translationService.instant(translationKeys.BoardingPassDownloadErrorMessage));
        },
      });
  }

  public initBoardingPassesForAllSegments(data: DownloadBoardingPassRequest): void {
    this.globalLoaderService.show();
    this.retrieveBoardingPass(data)
      .pipe(finalize(() => this.globalLoaderService.hide()))
      .subscribe({
        next: (response) => {
          this.boardingPassesBySegment = response.boardingPasses;
          this.loggerService.info(
            'BoardingPassPreviewComponent',
            `Boarding passes ${data.formatType} retrieved successfully`
          );
        },
        error: (error) => {
          this.loggerService.error(
            'BoardingPassPreviewComponent',
            `Error retrieving boarding passes ${data.formatType} for all segments`,
            error
          );
          this.trackAnalyticsError(error, `Error retrieving boarding passes ${data.formatType} for all segments`);
        },
      });
  }

  public processBoardingPassForSegment(formatType: BoardingPassFormatType, sellKey: string): void {
    if (!this.boardingPassesBySegment?.length) return;
    this.globalLoaderService.show();
    this.processBoardingPass({
      formatType,
      sellKey: sellKey,
      boardingPassDto: this.boardingPassesBySegment,
    })
      .pipe(finalize(() => this.globalLoaderService.hide()))
      .subscribe({
        next: () =>
          this.loggerService.info(
            'BoardingPassPreviewComponent',
            `Boarding pass ${formatType} processed successfully for segment ${sellKey}`
          ),
        error: (error) => {
          this.loggerService.error(
            'BoardingPassPreviewComponent',
            `Error processing boarding pass ${formatType} for segment ${sellKey}`,
            error
          );
          this.handleDownloadBoardingPassError();
          this.trackAnalyticsError(error, this.translationService.instant(translationKeys.BoardingPassDownloadErrorMessage));
        },
      });
  }

  public retrieveBoardingPass(data: DownloadBoardingPassRequest): Observable<BookingModels.BoardingPassResponseDto> {
    const requestDto = this.buildRequestDto(data);

    return this.bookingClient.generate('1', requestDto).pipe(
      map((response) => {
        if (response.result?.data) {
          return response.result.data;
        }
        throw new Error('No data in response');
      }),
      catchError((error) => {
        return throwError(() => error);
      })
    );
  }

  public initProcessBoardingPasses(proccessBoardingPasses?: ReadonlyArray<IProcessBoardingPass>): void {
    this.proccessBoardingPasses = proccessBoardingPasses;
  }

  private handleDownloadBoardingPassError(): void {
    this.notificationService.showNotification({
      title: this.translationService.instant(translationKeys.BoardingPassDownloadErrorTitle),
      message: this.translationService.instant(translationKeys.BoardingPassDownloadErrorMessage),
      alertType: AlertType.ERROR,
      buttonPrimaryText: this.translationService.instant(translationKeys.BoardingPassDownloadErrorButtonPrimaryText),
    });
  }

  private processBoardingPass(data: ProcessBoardingPassRequest): Observable<void> {
    if (!this.proccessBoardingPasses) {
      const error = new Error('Boarding pass processors not initialized. Call initProcessBoardingPasses first.');
      return throwError(() => error);
    }

    const processor = this.proccessBoardingPasses.find((p) => p.type === data.formatType);

    if (!processor) {
      const error = new Error(`No processor found for format type: ${data.formatType}`);
      return throwError(() => error);
    }

    return processor.execute(data);
  }

  private buildRequestDto(data: DownloadBoardingPassRequest): BookingModels.GetBoardingPassQuery {
    const currentLang: string = this.cultureServiceEx.getLanguageAndRegion();
    return {
      request: {
        format: data.formatType as unknown as BookingModels.BoardingPassFormatType,
        generation: BookingModels.BoardingPassGenerationType.PerPaxJourney,
        group: BookingModels.BoardingPassGroupType.ByJourney,
        items: [
          {
            paxId: data.paxId,
            sellKey: data.journeyId,
          },
        ],
        languageCultureCode: currentLang,
      },
    } as BookingModels.GetBoardingPassQuery;
  }

  private trackAnalyticsError(error: any, message: string): void {
    const dataEvent = {
      message: message,
      error_id: error?.error?.code
    } as DataEventModel;

    this.trackAnalyticsErrorService.trackAnalyticsError(dataEvent);
  }
}
