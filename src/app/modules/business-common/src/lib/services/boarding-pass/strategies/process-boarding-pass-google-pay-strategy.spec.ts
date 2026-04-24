import { TestBed } from '@angular/core/testing';
import { ProcessBoardingPassGooglePayService } from './process-boarding-pass-google-pay-strategy';
import { BoardingPassFormatType } from '../../../enums';
import { ProcessBoardingPassRequest } from '..';
import { BookingModels } from '@dcx/module/api-clients';

describe('ProcessBoardingPassGooglePayService', () => {
  let service: ProcessBoardingPassGooglePayService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ProcessBoardingPassGooglePayService],
    });

    service = TestBed.inject(ProcessBoardingPassGooglePayService);

    spyOn(document, 'createElement').and.returnValue({
      click: jasmine.createSpy('click'),
      href: '',
      download: '',
    } as any);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have GOOGLE_PAY type', () => {
    expect(service.type).toBe(BoardingPassFormatType.GOOGLE_PAY);
  });

  describe('execute', () => {
    it('should find boarding pass by sellKey and create anchor', (done) => {
      const mockAnchor = {
        click: jasmine.createSpy('click'),
        href: '',
        download: '',
      } as any;

      (document.createElement as jasmine.Spy).and.returnValue(mockAnchor);

      const request: ProcessBoardingPassRequest = {
        formatType: BoardingPassFormatType.GOOGLE_PAY,
        sellKey: 'journey1',
        boardingPassDto: [
          {
            sellKey: 'journey1',
            boardingPass: 'https://pay.google.com/pass',
          } as BookingModels.BoardingPassDto,
        ],
      };

      service.execute(request).subscribe({
        next: () => {
          expect(document.createElement).toHaveBeenCalledWith('a');
          expect(mockAnchor.href).toBe('https://pay.google.com/pass');
          expect(mockAnchor.download).toBe('');
          expect(mockAnchor.click).toHaveBeenCalled();
          done();
        },
        error: () => fail('should not error'),
      });
    });

    it('should handle multiple boarding passes and find correct one', (done) => {
      const mockAnchor = {
        click: jasmine.createSpy('click'),
        href: '',
        download: '',
      } as any;

      (document.createElement as jasmine.Spy).and.returnValue(mockAnchor);

      const request: ProcessBoardingPassRequest = {
        formatType: BoardingPassFormatType.GOOGLE_PAY,
        sellKey: 'journey2',
        boardingPassDto: [
          {
            sellKey: 'journey1',
            boardingPass: 'https://pay.google.com/pass1',
          } as BookingModels.BoardingPassDto,
          {
            sellKey: 'journey2',
            boardingPass: 'https://pay.google.com/pass2',
          } as BookingModels.BoardingPassDto,
        ],
      };

      service.execute(request).subscribe({
        next: () => {
          expect(mockAnchor.href).toBe('https://pay.google.com/pass2');
          expect(mockAnchor.click).toHaveBeenCalled();
          done();
        },
        error: () => fail('should not error'),
      });
    });

    it('should not create anchor when sellKey is not found', (done) => {
      const request: ProcessBoardingPassRequest = {
        formatType: BoardingPassFormatType.GOOGLE_PAY,
        sellKey: 'journey3',
        boardingPassDto: [
          {
            sellKey: 'journey1',
            boardingPass: 'https://pay.google.com/pass',
          } as BookingModels.BoardingPassDto,
        ],
      };

      service.execute(request).subscribe({
        next: () => {
          expect(document.createElement).not.toHaveBeenCalled();
          done();
        },
        error: () => fail('should not error'),
      });
    });

    it('should not create anchor when boardingPass is empty', (done) => {
      const request: ProcessBoardingPassRequest = {
        formatType: BoardingPassFormatType.GOOGLE_PAY,
        sellKey: 'journey1',
        boardingPassDto: [
          {
            sellKey: 'journey1',
            boardingPass: '',
          } as BookingModels.BoardingPassDto,
        ],
      };

      service.execute(request).subscribe({
        next: () => {
          expect(document.createElement).not.toHaveBeenCalled();
          done();
        },
        error: () => fail('should not error'),
      });
    });

    it('should not create anchor when boardingPass is undefined', (done) => {
      const request: ProcessBoardingPassRequest = {
        formatType: BoardingPassFormatType.GOOGLE_PAY,
        sellKey: 'journey1',
        boardingPassDto: [
          {
            sellKey: 'journey1',
            boardingPass: undefined,
          } as BookingModels.BoardingPassDto,
        ],
      };

      service.execute(request).subscribe({
        next: () => {
          expect(document.createElement).not.toHaveBeenCalled();
          done();
        },
        error: () => fail('should not error'),
      });
    });

    it('should complete successfully', (done) => {
      const request: ProcessBoardingPassRequest = {
        formatType: BoardingPassFormatType.GOOGLE_PAY,
        sellKey: 'journey1',
        boardingPassDto: [
          {
            sellKey: 'journey1',
            boardingPass: 'https://pay.google.com/pass',
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

    it('should handle empty boardingPassDto array', (done) => {
      const request: ProcessBoardingPassRequest = {
        formatType: BoardingPassFormatType.GOOGLE_PAY,
        sellKey: 'journey1',
        boardingPassDto: [],
      };

      service.execute(request).subscribe({
        next: () => {
          expect(document.createElement).not.toHaveBeenCalled();
          done();
        },
        error: () => fail('should not error'),
      });
    });
  });
});
