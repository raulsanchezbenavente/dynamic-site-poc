import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { ProcessBoardingPassPdfService } from './process-boarding-pass-pdf-strategy';
import { BoardingPassProxyService, ProcessBoardingPassRequest } from '..';
import { BoardingPassFormatType } from '../../../enums';
import { BookingModels } from '@dcx/module/api-clients';

describe('ProcessBoardingPassPdfService', () => {
  let service: ProcessBoardingPassPdfService;
  let mockBoardingPassProxyService: jasmine.SpyObj<BoardingPassProxyService>;
  let mockBlob: Blob;

  beforeEach(() => {
    mockBoardingPassProxyService = jasmine.createSpyObj('BoardingPassProxyService', ['getBlobPartFile']);
    mockBlob = new Blob(['fake pdf data'], { type: 'application/pdf' });

    TestBed.configureTestingModule({
      providers: [
        ProcessBoardingPassPdfService,
        { provide: BoardingPassProxyService, useValue: mockBoardingPassProxyService },
      ],
    });

    service = TestBed.inject(ProcessBoardingPassPdfService);

    // Mock global objects
    spyOn(globalThis.URL, 'createObjectURL').and.returnValue('blob:mock-url');
    spyOn(globalThis.URL, 'revokeObjectURL');
    spyOn(document, 'createElement').and.returnValue({
      click: jasmine.createSpy('click'),
      href: '',
      download: '',
    } as any);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have PDF type', () => {
    expect(service.type).toBe(BoardingPassFormatType.PDF);
  });

  describe('execute', () => {
    it('should return error observable when boarding pass data is not found', (done) => {
      const request: ProcessBoardingPassRequest = {
        formatType: BoardingPassFormatType.PDF,
        sellKey: 'journey1',
        boardingPassDto: [
          {
            boardingPass: undefined,
          } as BookingModels.BoardingPassDto,
        ],
      };

      service.execute(request).subscribe({
        next: () => fail('should not emit next'),
        error: (error) => {
          expect(error.message).toBe('Boarding pass data not found');
          done();
        },
      });
    });

    it('should return error observable when boardingPassDto is empty', (done) => {
      const request: ProcessBoardingPassRequest = {
        formatType: BoardingPassFormatType.PDF,
        sellKey: 'journey1',
        boardingPassDto: [],
      };

      service.execute(request).subscribe({
        next: () => fail('should not emit next'),
        error: (error) => {
          expect(error.message).toBe('Boarding pass data not found');
          done();
        },
      });
    });

    it('should call getBlobPartFile with correct parameters', (done) => {
      mockBoardingPassProxyService.getBlobPartFile.and.returnValue(of(mockBlob));

      const mockBoardingPassData = 'base64-encoded-data';
      const request: ProcessBoardingPassRequest = {
        formatType: BoardingPassFormatType.PDF,
        sellKey: 'journey1',
        boardingPassDto: [
          {
            boardingPass: mockBoardingPassData,
          } as BookingModels.BoardingPassDto,
        ],
      };

      service.execute(request).subscribe({
        next: () => {
          expect(mockBoardingPassProxyService.getBlobPartFile).toHaveBeenCalledWith(mockBoardingPassData, {
            responseType: 'blob' as const,
          });
          done();
        },
        error: () => fail('should not error'),
      });
    });

    it('should create blob with correct type', (done) => {
      mockBoardingPassProxyService.getBlobPartFile.and.returnValue(of(mockBlob));

      const request: ProcessBoardingPassRequest = {
        formatType: BoardingPassFormatType.PDF,
        sellKey: 'journey1',
        boardingPassDto: [
          {
            boardingPass: 'data',
          } as BookingModels.BoardingPassDto,
        ],
      };

      spyOn(globalThis, 'Blob').and.callThrough();

      service.execute(request).subscribe({
        next: () => {
          expect(globalThis.Blob).toHaveBeenCalledWith([mockBlob], { type: 'application/pdf' });
          done();
        },
        error: () => fail('should not error'),
      });
    });

    it('should create object URL and download file', (done) => {
      mockBoardingPassProxyService.getBlobPartFile.and.returnValue(of(mockBlob));

      const request: ProcessBoardingPassRequest = {
        formatType: BoardingPassFormatType.PDF,
        sellKey: 'journey1',
        boardingPassDto: [
          {
            boardingPass: 'data',
          } as BookingModels.BoardingPassDto,
        ],
      };

      const mockAnchor = {
        click: jasmine.createSpy('click'),
        href: '',
        download: '',
      } as any;

      (document.createElement as jasmine.Spy).and.returnValue(mockAnchor);

      service.execute(request).subscribe({
        next: () => {
          expect(globalThis.URL.createObjectURL).toHaveBeenCalled();
          expect(mockAnchor.href).toBe('blob:mock-url');
          expect(mockAnchor.download).toBe('boarding-pass.pdf');
          expect(mockAnchor.click).toHaveBeenCalled();
          expect(globalThis.URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
          done();
        },
        error: () => fail('should not error'),
      });
    });

    it('should handle IE/Edge msSaveOrOpenBlob', (done) => {
      mockBoardingPassProxyService.getBlobPartFile.and.returnValue(of(mockBlob));

      const msSaveOrOpenBlob = jasmine.createSpy('msSaveOrOpenBlob');
      const originalNavigator = globalThis.navigator;
      Object.defineProperty(globalThis, 'navigator', {
        value: { ...originalNavigator, msSaveOrOpenBlob },
        writable: true,
        configurable: true,
      });

      const request: ProcessBoardingPassRequest = {
        formatType: BoardingPassFormatType.PDF,
        sellKey: 'journey1',
        boardingPassDto: [
          {
            boardingPass: 'data',
          } as BookingModels.BoardingPassDto,
        ],
      };

      service.execute(request).subscribe({
        next: () => {
          expect(msSaveOrOpenBlob).toHaveBeenCalled();
          expect(globalThis.URL.revokeObjectURL).toHaveBeenCalled();

          // Restore original navigator
          Object.defineProperty(globalThis, 'navigator', {
            value: originalNavigator,
            writable: true,
            configurable: true,
          });
          done();
        },
        error: () => fail('should not error'),
      });
    });

    it('should propagate error from getBlobPartFile', (done) => {
      const mockError = new Error('Network error');
      mockBoardingPassProxyService.getBlobPartFile.and.returnValue(throwError(() => mockError));

      const request: ProcessBoardingPassRequest = {
        formatType: BoardingPassFormatType.PDF,
        sellKey: 'journey1',
        boardingPassDto: [
          {
            boardingPass: 'data',
          } as BookingModels.BoardingPassDto,
        ],
      };

      service.execute(request).subscribe({
        next: () => fail('should not emit next'),
        error: (error) => {
          expect(error.message).toBeTruthy();
          done();
        },
      });
    });

    it('should complete successfully after download', (done) => {
      mockBoardingPassProxyService.getBlobPartFile.and.returnValue(of(mockBlob));

      const request: ProcessBoardingPassRequest = {
        formatType: BoardingPassFormatType.PDF,
        sellKey: 'journey1',
        boardingPassDto: [
          {
            boardingPass: 'data',
          } as BookingModels.BoardingPassDto,
        ],
      };

      service.execute(request).subscribe({
        next: () => {
          expect(true).toBe(true);
        },
        error: () => fail('should not error'),
        complete: () => {
          expect(true).toBe(true);
          done();
        },
      });
    });
  });
});
