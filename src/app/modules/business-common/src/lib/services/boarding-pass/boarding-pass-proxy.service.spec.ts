import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { BoardingPassProxyService } from './boarding-pass-proxy.service';

describe('BoardingPassProxyService', () => {
  let service: BoardingPassProxyService;
  let httpClient: jasmine.SpyObj<HttpClient>;

  beforeEach(() => {
    const httpClientSpy = jasmine.createSpyObj('HttpClient', ['get']);

    TestBed.configureTestingModule({
      providers: [
        BoardingPassProxyService,
        { provide: HttpClient, useValue: httpClientSpy },
      ],
    });

    service = TestBed.inject(BoardingPassProxyService);
    httpClient = TestBed.inject(HttpClient) as jasmine.SpyObj<HttpClient>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getBlobPartFile', () => {
    it('should call httpClient.get with correct parameters and return Blob observable', (done) => {
      const mockUrl = 'https://example.com/boarding-pass.pdf';
      const mockHttpOptions = { responseType: 'blob' as 'json' };
      const mockBlob = new Blob(['mock data'], { type: 'application/pdf' });

      httpClient.get.and.returnValue(of(mockBlob));

      service.getBlobPartFile(mockUrl, mockHttpOptions).subscribe({
        next: (result) => {
          expect(httpClient.get).toHaveBeenCalledWith(mockUrl, mockHttpOptions);
          expect(result).toEqual(mockBlob);
          expect(result instanceof Blob).toBe(true);
          done();
        },
      });
    });

    it('should handle different URLs', (done) => {
      const differentUrl = 'https://api.example.com/files/document.pdf';
      const mockHttpOptions = { responseType: 'blob' as 'json', headers: { Authorization: 'Bearer token' } };
      const mockBlob = new Blob(['different data'], { type: 'application/pdf' });

      httpClient.get.and.returnValue(of(mockBlob));

      service.getBlobPartFile(differentUrl, mockHttpOptions).subscribe({
        next: (result) => {
          expect(httpClient.get).toHaveBeenCalledWith(differentUrl, mockHttpOptions);
          expect(result).toEqual(mockBlob);
          done();
        },
      });
    });

    it('should pass through httpOptions correctly', (done) => {
      const mockUrl = 'https://example.com/file.pdf';
      const customOptions = {
        responseType: 'blob' as 'json',
        headers: { 'Custom-Header': 'value' },
        params: { key: 'value' },
      };
      const mockBlob = new Blob(['test'], { type: 'application/pdf' });

      httpClient.get.and.returnValue(of(mockBlob));

      service.getBlobPartFile(mockUrl, customOptions).subscribe({
        next: () => {
          expect(httpClient.get).toHaveBeenCalledWith(mockUrl, customOptions);
          done();
        },
      });
    });
  });
});
