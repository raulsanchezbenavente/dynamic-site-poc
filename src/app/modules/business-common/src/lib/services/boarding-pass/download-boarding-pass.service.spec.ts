import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { BookingClient, BookingModels } from '@dcx/module/api-clients';
import { AlertType, CultureServiceEx, LoggerService, NotificationService } from '@dcx/ui/libs';
import { TranslateService } from '@ngx-translate/core';
import { DownloadBoardingPassService } from './download-boarding-pass.service';
import { BoardingPassFormatType } from '../../enums';
import { DownloadBoardingPassRequest, IProcessBoardingPass } from '.';
import { GlobalLoaderService } from '../global-loader.service';
import { TrackAnalyticsErrorService } from '../analytics/track-analytics-error';

describe('DownloadBoardingPassService', () => {
  let service: DownloadBoardingPassService;
  let mockBookingClient: jasmine.SpyObj<BookingClient>;
  let mockCultureServiceEx: jasmine.SpyObj<CultureServiceEx>;
  let mockGlobalLoaderService: jasmine.SpyObj<GlobalLoaderService>;
  let mockLogger: jasmine.SpyObj<LoggerService>;
  let mockTranslationService: jasmine.SpyObj<TranslateService>;
  let mockNotificationService: jasmine.SpyObj<NotificationService>;
  let mockTrackAnalyticsErrorService: jasmine.SpyObj<TrackAnalyticsErrorService>;

  const mockBoardingPassResponse: BookingModels.BoardingPassResponseDto = {
    boardingPasses: [
      {
        boardingPass: 'base64-encoded-data',
        paxId: 'PAX123',
      } as BookingModels.BoardingPassDto,
    ],
    init: jasmine.createSpy('init'),
    toJSON: jasmine.createSpy('toJSON'),
  };

  const mockProcessorPdf: IProcessBoardingPass = {
    type: BoardingPassFormatType.PDF,
    execute: jasmine.createSpy('execute').and.returnValue(of(undefined)),
  };

  const mockProcessorWallet: IProcessBoardingPass = {
    type: BoardingPassFormatType.DEFAULT,
    execute: jasmine.createSpy('execute').and.returnValue(of(undefined)),
  };

  beforeEach(() => {
    mockBookingClient = jasmine.createSpyObj('BookingClient', ['generate']);
    mockCultureServiceEx = jasmine.createSpyObj('CultureServiceEx', ['getLanguageAndRegion']);
    mockGlobalLoaderService = jasmine.createSpyObj('GlobalLoaderService', ['show', 'hide']);
    mockLogger = jasmine.createSpyObj('LoggerService', ['info', 'error']);
    mockTranslationService = jasmine.createSpyObj('TranslateService', ['instant']);
    mockNotificationService = jasmine.createSpyObj('NotificationService', ['showNotification']);
    mockTrackAnalyticsErrorService = jasmine.createSpyObj('TrackAnalyticsErrorService', ['trackAnalyticsError']);

    mockCultureServiceEx.getLanguageAndRegion.and.returnValue('en-US');
    mockTranslationService.instant.and.callFake((key: string) => {
      const translations: Record<string, string> = {
        'BoardingPass.DownloadErrorTitle': 'Download Error',
        'BoardingPass.DownloadErrorMessage': 'Failed to download boarding pass',
        'Common.OK': 'OK',
      };
      return translations[key] || key;
    });

    TestBed.configureTestingModule({
      providers: [
        DownloadBoardingPassService,
        { provide: BookingClient, useValue: mockBookingClient },
        { provide: CultureServiceEx, useValue: mockCultureServiceEx },
        { provide: GlobalLoaderService, useValue: mockGlobalLoaderService },
        { provide: LoggerService, useValue: mockLogger },
        { provide: TranslateService, useValue: mockTranslationService },
        { provide: NotificationService, useValue: mockNotificationService },
        { provide: TrackAnalyticsErrorService, useValue: mockTrackAnalyticsErrorService },
      ],
    });

    service = TestBed.inject(DownloadBoardingPassService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('initProcessBoardingPasses', () => {
    it('should initialize processors', () => {
      const processors = [mockProcessorPdf, mockProcessorWallet];

      service.initProcessBoardingPasses(processors);

      expect(service['proccessBoardingPasses']).toBe(processors);
    });

    it('should allow undefined processors', () => {
      service.initProcessBoardingPasses(undefined);

      expect(service['proccessBoardingPasses']).toBeUndefined();
    });
  });

  describe('downloadBoardingPassPdf', () => {
    beforeEach(() => {
      (mockProcessorPdf.execute as jasmine.Spy).calls.reset();
      mockBookingClient.generate.and.returnValue(
        of({
          result: {
            data: mockBoardingPassResponse,
          },
        } as any)
      );
    });

    it('should show global loader', () => {
      service.initProcessBoardingPasses([mockProcessorPdf]);
      const request: DownloadBoardingPassRequest = {
        paxId: 'PAX123',
        journeyId: 'journey1',
        formatType: BoardingPassFormatType.PDF,
      };

      service.downloadBoardingPassPdf(request);

      expect(mockGlobalLoaderService.show).toHaveBeenCalled();
    });

    it('should call bookingClient.generate with correct parameters', () => {
      service.initProcessBoardingPasses([mockProcessorPdf]);
      const request: DownloadBoardingPassRequest = {
        paxId: 'PAX123',
        journeyId: 'journey1',
        formatType: BoardingPassFormatType.PDF,
      };

      service.downloadBoardingPassPdf(request);

      expect(mockBookingClient.generate).toHaveBeenCalledWith('1', jasmine.objectContaining({
        request: jasmine.objectContaining({
          format: BoardingPassFormatType.PDF,
          generation: BookingModels.BoardingPassGenerationType.PerPaxJourney,
          group: BookingModels.BoardingPassGroupType.ByJourney,
          items: jasmine.arrayContaining([
            jasmine.objectContaining({
              paxId: 'PAX123',
              sellKey: 'journey1',
            }),
          ]),
          languageCultureCode: 'en-US',
        }),
      }));
    });

    it('should use culture service for language', () => {
      service.initProcessBoardingPasses([mockProcessorPdf]);
      const request: DownloadBoardingPassRequest = {
        paxId: 'PAX123',
        journeyId: 'journey1',
        formatType: BoardingPassFormatType.PDF,
      };

      service.downloadBoardingPassPdf(request);

      expect(mockCultureServiceEx.getLanguageAndRegion).toHaveBeenCalled();
    });

    it('should call processor execute with correct data', (done) => {
      service.initProcessBoardingPasses([mockProcessorPdf]);
      const request: DownloadBoardingPassRequest = {
        paxId: 'PAX123',
        journeyId: 'journey1',
        formatType: BoardingPassFormatType.PDF,
      };

      service.downloadBoardingPassPdf(request);

      setTimeout(() => {
        expect(mockProcessorPdf.execute).toHaveBeenCalledWith({
          formatType: BoardingPassFormatType.PDF,
          sellKey: 'journey1',
          boardingPassDto: mockBoardingPassResponse.boardingPasses!,
        });
        done();
      }, 100);
    });

    it('should hide loader on success', (done) => {
      service.initProcessBoardingPasses([mockProcessorPdf]);
      const request: DownloadBoardingPassRequest = {
        paxId: 'PAX123',
        journeyId: 'journey1',
        formatType: BoardingPassFormatType.PDF,
      };

      service.downloadBoardingPassPdf(request);

      setTimeout(() => {
        expect(mockGlobalLoaderService.hide).toHaveBeenCalled();
        done();
      }, 100);
    });

    it('should log success message', (done) => {
      service.initProcessBoardingPasses([mockProcessorPdf]);
      const request: DownloadBoardingPassRequest = {
        paxId: 'PAX123',
        journeyId: 'journey1',
        formatType: BoardingPassFormatType.PDF,
      };

      service.downloadBoardingPassPdf(request);

      setTimeout(() => {
        expect(mockLogger.info).toHaveBeenCalledWith(
          'BoardingPassPreviewComponent',
          `Boarding pass ${BoardingPassFormatType.PDF} processed successfully`
        );
        done();
      }, 100);
    });

    it('should handle error when no boarding passes in response', (done) => {
      mockBookingClient.generate.and.returnValue(
        of({
          result: {
            data: {
              boardingPasses: [],
            },
          },
        } as any)
      );
      service.initProcessBoardingPasses([mockProcessorPdf]);
      const request: DownloadBoardingPassRequest = {
        paxId: 'PAX123',
        journeyId: 'journey1',
        formatType: BoardingPassFormatType.PDF,
      };

      service.downloadBoardingPassPdf(request);

      setTimeout(() => {
        expect(mockGlobalLoaderService.hide).toHaveBeenCalled();
        expect(mockNotificationService.showNotification).toHaveBeenCalledWith({
          title: 'Download Error',
          message: 'Failed to download boarding pass',
          alertType: AlertType.ERROR,
          buttonPrimaryText: 'OK',
        });
        expect(mockLogger.error).toHaveBeenCalled();
        done();
      }, 100);
    });

    it('should handle error when no data in response', (done) => {
      mockBookingClient.generate.and.returnValue(
        of({
          result: {
            data: null,
          },
        } as any)
      );
      service.initProcessBoardingPasses([mockProcessorPdf]);
      const request: DownloadBoardingPassRequest = {
        paxId: 'PAX123',
        journeyId: 'journey1',
        formatType: BoardingPassFormatType.PDF,
      };

      service.downloadBoardingPassPdf(request);

      setTimeout(() => {
        expect(mockGlobalLoaderService.hide).toHaveBeenCalled();
        expect(mockNotificationService.showNotification).toHaveBeenCalled();
        expect(mockLogger.error).toHaveBeenCalled();
        done();
      }, 100);
    });

    it('should handle error when processors not initialized', (done) => {
      const request: DownloadBoardingPassRequest = {
        paxId: 'PAX123',
        journeyId: 'journey1',
        formatType: BoardingPassFormatType.PDF,
      };

      service.downloadBoardingPassPdf(request);

      setTimeout(() => {
        expect(mockGlobalLoaderService.hide).toHaveBeenCalled();
        expect(mockNotificationService.showNotification).toHaveBeenCalled();
        expect(mockLogger.error).toHaveBeenCalledWith(
          'BoardingPassPreviewComponent',
          `Error downloading boarding pass ${BoardingPassFormatType.PDF}`,
          jasmine.any(Error)
        );
        done();
      }, 100);
    });

    it('should handle error when no processor found for format type', (done) => {
      service.initProcessBoardingPasses([mockProcessorWallet]);
      const request: DownloadBoardingPassRequest = {
        paxId: 'PAX123',
        journeyId: 'journey1',
        formatType: BoardingPassFormatType.PDF,
      };

      service.downloadBoardingPassPdf(request);

      setTimeout(() => {
        expect(mockGlobalLoaderService.hide).toHaveBeenCalled();
        expect(mockNotificationService.showNotification).toHaveBeenCalled();
        expect(mockLogger.error).toHaveBeenCalled();
        done();
      }, 100);
    });

    it('should handle error from bookingClient', (done) => {
      mockBookingClient.generate.and.returnValue(throwError(() => new Error('Network error')));
      service.initProcessBoardingPasses([mockProcessorPdf]);
      const request: DownloadBoardingPassRequest = {
        paxId: 'PAX123',
        journeyId: 'journey1',
        formatType: BoardingPassFormatType.PDF,
      };

      service.downloadBoardingPassPdf(request);

      setTimeout(() => {
        expect(mockGlobalLoaderService.hide).toHaveBeenCalled();
        expect(mockNotificationService.showNotification).toHaveBeenCalled();
        expect(mockLogger.error).toHaveBeenCalledWith(
          'BoardingPassPreviewComponent',
          `Error downloading boarding pass ${BoardingPassFormatType.PDF}`,
          jasmine.any(Error)
        );
        done();
      }, 100);
    });

    it('should handle error from processor execution', (done) => {
      const errorProcessor: IProcessBoardingPass = {
        type: BoardingPassFormatType.PDF,
        execute: jasmine.createSpy('execute').and.returnValue(throwError(() => new Error('Processor error'))),
      };

      service.initProcessBoardingPasses([errorProcessor]);
      const request: DownloadBoardingPassRequest = {
        paxId: 'PAX123',
        journeyId: 'journey1',
        formatType: BoardingPassFormatType.PDF,
      };

      service.downloadBoardingPassPdf(request);

      setTimeout(() => {
        expect(mockGlobalLoaderService.hide).toHaveBeenCalled();
        expect(mockNotificationService.showNotification).toHaveBeenCalled();
        expect(mockLogger.error).toHaveBeenCalled();
        done();
      }, 100);
    });
  });

  describe('initBoardingPassesForAllSegments', () => {
    beforeEach(() => {
      mockBookingClient.generate.and.returnValue(
        of({
          result: {
            data: mockBoardingPassResponse,
          },
        } as any)
      );
    });

    it('should show global loader', () => {
      const request: DownloadBoardingPassRequest = {
        paxId: 'PAX123',
        journeyId: 'journey1',
        formatType: BoardingPassFormatType.APPLE_WALLET,
      };

      service.initBoardingPassesForAllSegments(request);

      expect(mockGlobalLoaderService.show).toHaveBeenCalled();
    });

    it('should retrieve and store boarding passes', (done) => {
      const request: DownloadBoardingPassRequest = {
        paxId: 'PAX123',
        journeyId: 'journey1',
        formatType: BoardingPassFormatType.APPLE_WALLET,
      };

      service.initBoardingPassesForAllSegments(request);

      setTimeout(() => {
        expect(service['boardingPassesBySegment']).toBe(mockBoardingPassResponse.boardingPasses);
        done();
      }, 100);
    });

    it('should log success message', (done) => {
      const request: DownloadBoardingPassRequest = {
        paxId: 'PAX123',
        journeyId: 'journey1',
        formatType: BoardingPassFormatType.APPLE_WALLET,
      };

      service.initBoardingPassesForAllSegments(request);

      setTimeout(() => {
        expect(mockLogger.info).toHaveBeenCalledWith(
          'BoardingPassPreviewComponent',
          `Boarding passes ${BoardingPassFormatType.APPLE_WALLET} retrieved successfully`
        );
        done();
      }, 100);
    });

    it('should hide loader on success', (done) => {
      const request: DownloadBoardingPassRequest = {
        paxId: 'PAX123',
        journeyId: 'journey1',
        formatType: BoardingPassFormatType.APPLE_WALLET,
      };

      service.initBoardingPassesForAllSegments(request);

      setTimeout(() => {
        expect(mockGlobalLoaderService.hide).toHaveBeenCalled();
        done();
      }, 100);
    });

    it('should handle error from bookingClient', (done) => {
      mockBookingClient.generate.and.returnValue(throwError(() => new Error('Network error')));
      const request: DownloadBoardingPassRequest = {
        paxId: 'PAX123',
        journeyId: 'journey1',
        formatType: BoardingPassFormatType.APPLE_WALLET,
      };

      service.initBoardingPassesForAllSegments(request);

      setTimeout(() => {
        expect(mockGlobalLoaderService.hide).toHaveBeenCalled();
        expect(mockLogger.error).toHaveBeenCalledWith(
          'BoardingPassPreviewComponent',
          `Error retrieving boarding passes ${BoardingPassFormatType.APPLE_WALLET} for all segments`,
          jasmine.any(Error)
        );
        done();
      }, 100);
    });
  });

  describe('processBoardingPassForSegment', () => {
    const mockProcessorAppleWallet: IProcessBoardingPass = {
      type: BoardingPassFormatType.APPLE_WALLET,
      execute: jasmine.createSpy('execute').and.returnValue(of(undefined)),
    };

    beforeEach(() => {
      service['boardingPassesBySegment'] = mockBoardingPassResponse.boardingPasses;
      (mockProcessorAppleWallet.execute as jasmine.Spy).calls.reset();
      service.initProcessBoardingPasses([mockProcessorAppleWallet]);
    });

    it('should return early if boardingPassesBySegment is empty', () => {
      service['boardingPassesBySegment'] = undefined;

      service.processBoardingPassForSegment(BoardingPassFormatType.APPLE_WALLET, 'journey1');

      expect(mockGlobalLoaderService.show).not.toHaveBeenCalled();
    });

    it('should show global loader', () => {
      service.processBoardingPassForSegment(BoardingPassFormatType.APPLE_WALLET, 'journey1');

      expect(mockGlobalLoaderService.show).toHaveBeenCalled();
    });

    it('should call processor execute with correct data', (done) => {
      service.processBoardingPassForSegment(BoardingPassFormatType.APPLE_WALLET, 'journey1');

      setTimeout(() => {
        expect(mockProcessorAppleWallet.execute).toHaveBeenCalledWith({
          formatType: BoardingPassFormatType.APPLE_WALLET,
          sellKey: 'journey1',
          boardingPassDto: mockBoardingPassResponse.boardingPasses!,
        });
        done();
      }, 100);
    });

    it('should hide loader on success', (done) => {
      service.processBoardingPassForSegment(BoardingPassFormatType.APPLE_WALLET, 'journey1');

      setTimeout(() => {
        expect(mockGlobalLoaderService.hide).toHaveBeenCalled();
        done();
      }, 100);
    });

    it('should log success message with segment info', (done) => {
      service.processBoardingPassForSegment(BoardingPassFormatType.APPLE_WALLET, 'journey1');

      setTimeout(() => {
        expect(mockLogger.info).toHaveBeenCalledWith(
          'BoardingPassPreviewComponent',
          `Boarding pass ${BoardingPassFormatType.APPLE_WALLET} processed successfully for segment journey1`
        );
        done();
      }, 100);
    });

    it('should handle error from processor execution', (done) => {
      const errorProcessor: IProcessBoardingPass = {
        type: BoardingPassFormatType.APPLE_WALLET,
        execute: jasmine.createSpy('execute').and.returnValue(throwError(() => new Error('Processor error'))),
      };
      service.initProcessBoardingPasses([errorProcessor]);

      service.processBoardingPassForSegment(BoardingPassFormatType.APPLE_WALLET, 'journey1');

      setTimeout(() => {
        expect(mockGlobalLoaderService.hide).toHaveBeenCalled();
        expect(mockNotificationService.showNotification).toHaveBeenCalled();
        expect(mockLogger.error).toHaveBeenCalledWith(
          'BoardingPassPreviewComponent',
          `Error processing boarding pass ${BoardingPassFormatType.APPLE_WALLET} for segment journey1`,
          jasmine.any(Error)
        );
        done();
      }, 100);
    });
  });

  describe('trackAnalyticsError', () => {
    beforeEach(() => {
      // Reset spies
      mockTrackAnalyticsErrorService.trackAnalyticsError.calls.reset();
    });

    it('should call trackAnalyticsErrorService with error message', fakeAsync(() => {
      // Arrange
      const mockError = { message: 'Service confirmation failed' };

      // Act
      service['trackAnalyticsError'](mockError, mockError.message);
      tick();

      // Assert
      expect(mockTrackAnalyticsErrorService.trackAnalyticsError).toHaveBeenCalledWith(
        jasmine.objectContaining({
          message: 'Service confirmation failed',
        })
      );
    }));

    it('should handle error with undefined message', fakeAsync(() => {
      // Arrange
      const mockError = { code: 'ERROR_CODE' };

      // Act
      service['trackAnalyticsError'](mockError, '');
      tick();

      // Assert
      expect(mockTrackAnalyticsErrorService.trackAnalyticsError).toHaveBeenCalledWith(
        jasmine.objectContaining({
          message: '',
        })
      );
    }));

    it('should handle null or undefined error object', fakeAsync(() => {
      // Arrange
      const mockError = null;

      // Act
      service['trackAnalyticsError'](mockError, '');
      tick();

      // Assert
      expect(mockTrackAnalyticsErrorService.trackAnalyticsError).toHaveBeenCalledWith(
        jasmine.objectContaining({
          message: '',
        })
      );
    }));
  });
});
