import { TestBed } from '@angular/core/testing';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ConfigService } from '@dcx/ui/libs';
import { of } from 'rxjs';

import { RepositoryResourcesService } from './repository-resources.service';
import { ResourceEnvelope } from '../models/dtos/resource/resource-envelope.dto';

interface MockCarrier {
  name: string;
  code: string;
  externalUrl: string;
  logo: string;
}

describe('RepositoryResourcesService', () => {
  let service: RepositoryResourcesService;
  let httpClient: jasmine.SpyObj<HttpClient>;
  let configService: jasmine.SpyObj<ConfigService>;

  const mockEndpoints = {
    apiURLRepositoryResources: 'https://api.test.com/repositoryresources/api/v1',
  };

  beforeEach(() => {
    const httpClientSpy = jasmine.createSpyObj('HttpClient', ['get']);
    const configServiceSpy = jasmine.createSpyObj('ConfigService', ['getEndpointsConfig']);

    configServiceSpy.getEndpointsConfig.and.returnValue(mockEndpoints as any);

    TestBed.configureTestingModule({
      providers: [
        RepositoryResourcesService,
        { provide: HttpClient, useValue: httpClientSpy },
        { provide: ConfigService, useValue: configServiceSpy },
      ],
    });

    service = TestBed.inject(RepositoryResourcesService);
    httpClient = TestBed.inject(HttpClient) as jasmine.SpyObj<HttpClient>;
    configService = TestBed.inject(ConfigService) as jasmine.SpyObj<ConfigService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getResource', () => {
    it('should call httpClient.get with correct URL and params for carriers', (done) => {
      const mockResponse: ResourceEnvelope<MockCarrier> = {
        resourceType: 'carriers',
        culture: 'en-US',
        data: [
          { name: 'Avianca', code: 'AV', externalUrl: 'https://avianca.com', logo: 'av-logo.png' },
        ],
        metadata: {
          count: 1,
          generatedAt: '2026-03-24T12:00:00Z',
        },
      };

      httpClient.get.and.returnValue(of(mockResponse));

      service.getResource<MockCarrier>('carriers', { culture: 'en-US' }).subscribe({
        next: (result) => {
          expect(configService.getEndpointsConfig).toHaveBeenCalled();
          expect(httpClient.get).toHaveBeenCalledWith(
            'https://api.test.com/repositoryresources/api/v1/carriers',
            jasmine.objectContaining({
              params: jasmine.any(HttpParams),
            })
          );
          expect(result).toEqual(mockResponse);
          expect(result.data.length).toBe(1);
          expect(result.data[0].code).toBe('AV');
          done();
        },
      });
    });

    it('should handle different resource types (airports)', (done) => {
      const mockResponse: ResourceEnvelope<any> = {
        resourceType: 'airports',
        culture: 'es-ES',
        data: [{ iata: 'BOG', name: 'El Dorado International Airport' }],
        metadata: {
          count: 1,
          generatedAt: '2026-03-24T12:00:00Z',
        },
      };

      httpClient.get.and.returnValue(of(mockResponse));

      service.getResource<any>('airports', { culture: 'es-ES' }).subscribe({
        next: (result) => {
          expect(httpClient.get).toHaveBeenCalledWith(
            'https://api.test.com/repositoryresources/api/v1/airports',
            jasmine.any(Object)
          );
          expect(result.resourceType).toBe('airports');
          done();
        },
      });
    });

    it('should build HttpParams with culture parameter', (done) => {
      const mockResponse: ResourceEnvelope<any> = {
        resourceType: 'carriers',
        culture: 'en-US',
        data: [],
        metadata: { count: 0, generatedAt: '2026-03-24T12:00:00Z' },
      };

      httpClient.get.and.returnValue(of(mockResponse));

      service.getResource<any>('carriers', { culture: 'en-US' }).subscribe({
        next: () => {
          const callArgs = httpClient.get.calls.mostRecent().args;
          const params = callArgs[1]?.params as HttpParams;
          expect(params.get('culture')).toBe('en-US');
          done();
        },
      });
    });

    it('should include additional query parameters', (done) => {
      const mockResponse: ResourceEnvelope<any> = {
        resourceType: 'carriers',
        culture: 'en-US',
        data: [],
        metadata: { count: 0, generatedAt: '2026-03-24T12:00:00Z' },
      };

      httpClient.get.and.returnValue(of(mockResponse));

      service
        .getResource<any>('carriers', {
          culture: 'en-US',
          active: true,
          limit: 100,
        })
        .subscribe({
          next: () => {
            const callArgs = httpClient.get.calls.mostRecent().args;
            const params = callArgs[1]?.params as HttpParams;
            expect(params.get('culture')).toBe('en-US');
            expect(params.get('active')).toBe('true');
            expect(params.get('limit')).toBe('100');
            done();
          },
        });
    });

    it('should filter out undefined query parameters', (done) => {
      const mockResponse: ResourceEnvelope<any> = {
        resourceType: 'carriers',
        culture: 'en-US',
        data: [],
        metadata: { count: 0, generatedAt: '2026-03-24T12:00:00Z' },
      };

      httpClient.get.and.returnValue(of(mockResponse));

      service
        .getResource<any>('carriers', {
          culture: 'en-US',
          optional: undefined,
        })
        .subscribe({
          next: () => {
            const callArgs = httpClient.get.calls.mostRecent().args;
            const params = callArgs[1]?.params as HttpParams;
            expect(params.get('culture')).toBe('en-US');
            expect(params.has('optional')).toBe(false);
            done();
          },
        });
    });

    it('should filter out null query parameters', (done) => {
      const mockResponse: ResourceEnvelope<any> = {
        resourceType: 'carriers',
        culture: 'en-US',
        data: [],
        metadata: { count: 0, generatedAt: '2026-03-24T12:00:00Z' },
      };

      httpClient.get.and.returnValue(of(mockResponse));

      service
        .getResource<any>('carriers', {
          culture: 'en-US',
          nullValue: null as any,
        })
        .subscribe({
          next: () => {
            const callArgs = httpClient.get.calls.mostRecent().args;
            const params = callArgs[1]?.params as HttpParams;
            expect(params.get('culture')).toBe('en-US');
            expect(params.has('nullValue')).toBe(false);
            done();
          },
        });
    });

    it('should convert numeric parameters to strings', (done) => {
      const mockResponse: ResourceEnvelope<any> = {
        resourceType: 'carriers',
        culture: 'en-US',
        data: [],
        metadata: { count: 0, generatedAt: '2026-03-24T12:00:00Z' },
      };

      httpClient.get.and.returnValue(of(mockResponse));

      service
        .getResource<any>('carriers', {
          culture: 'en-US',
          page: 1,
          limit: 50,
        })
        .subscribe({
          next: () => {
            const callArgs = httpClient.get.calls.mostRecent().args;
            const params = callArgs[1]?.params as HttpParams;
            expect(params.get('page')).toBe('1');
            expect(params.get('limit')).toBe('50');
            done();
          },
        });
    });

    it('should convert boolean parameters to strings', (done) => {
      const mockResponse: ResourceEnvelope<any> = {
        resourceType: 'carriers',
        culture: 'en-US',
        data: [],
        metadata: { count: 0, generatedAt: '2026-03-24T12:00:00Z' },
      };

      httpClient.get.and.returnValue(of(mockResponse));

      service
        .getResource<any>('carriers', {
          culture: 'en-US',
          active: true,
          archived: false,
        })
        .subscribe({
          next: () => {
            const callArgs = httpClient.get.calls.mostRecent().args;
            const params = callArgs[1]?.params as HttpParams;
            expect(params.get('active')).toBe('true');
            expect(params.get('archived')).toBe('false');
            done();
          },
        });
    });

    it('should handle multiple carriers in response data', (done) => {
      const mockResponse: ResourceEnvelope<MockCarrier> = {
        resourceType: 'carriers',
        culture: 'en-US',
        data: [
          { name: 'Avianca', code: 'AV', externalUrl: 'https://avianca.com', logo: 'av-logo.png' },
          { name: 'LATAM', code: 'LA', externalUrl: 'https://latam.com', logo: 'la-logo.png' },
          { name: 'Copa Airlines', code: 'CM', externalUrl: 'https://copa.com', logo: 'cm-logo.png' },
        ],
        metadata: {
          count: 3,
          generatedAt: '2026-03-24T12:00:00Z',
        },
      };

      httpClient.get.and.returnValue(of(mockResponse));

      service.getResource<MockCarrier>('carriers', { culture: 'en-US' }).subscribe({
        next: (result) => {
          expect(result.data.length).toBe(3);
          expect(result.metadata.count).toBe(3);
          expect(result.data[0].name).toBe('Avianca');
          expect(result.data[1].name).toBe('LATAM');
          expect(result.data[2].name).toBe('Copa Airlines');
          done();
        },
      });
    });

    it('should handle empty data array', (done) => {
      const mockResponse: ResourceEnvelope<MockCarrier> = {
        resourceType: 'carriers',
        culture: 'en-US',
        data: [],
        metadata: {
          count: 0,
          generatedAt: '2026-03-24T12:00:00Z',
        },
      };

      httpClient.get.and.returnValue(of(mockResponse));

      service.getResource<MockCarrier>('carriers', { culture: 'en-US' }).subscribe({
        next: (result) => {
          expect(result.data.length).toBe(0);
          expect(result.metadata.count).toBe(0);
          done();
        },
      });
    });

    it('should build correct URL for different base configurations', (done) => {
      configService.getEndpointsConfig.and.returnValue({
        apiURLRepositoryResources: 'https://different-api.com/repo-api/v2',
      } as any);

      const mockResponse: ResourceEnvelope<any> = {
        resourceType: 'carriers',
        culture: 'en-US',
        data: [],
        metadata: { count: 0, generatedAt: '2026-03-24T12:00:00Z' },
      };

      httpClient.get.and.returnValue(of(mockResponse));

      service.getResource<any>('carriers', { culture: 'en-US' }).subscribe({
        next: () => {
          expect(httpClient.get).toHaveBeenCalledWith(
            'https://different-api.com/repo-api/v2/carriers',
            jasmine.any(Object)
          );
          done();
        },
      });
    });

    it('should handle resource type with hyphens', (done) => {
      const mockResponse: ResourceEnvelope<any> = {
        resourceType: 'airport-facilities',
        culture: 'en-US',
        data: [],
        metadata: { count: 0, generatedAt: '2026-03-24T12:00:00Z' },
      };

      httpClient.get.and.returnValue(of(mockResponse));

      service.getResource<any>('airport-facilities', { culture: 'en-US' }).subscribe({
        next: () => {
          expect(httpClient.get).toHaveBeenCalledWith(
            'https://api.test.com/repositoryresources/api/v1/airport-facilities',
            jasmine.any(Object)
          );
          done();
        },
      });
    });
  });
});
