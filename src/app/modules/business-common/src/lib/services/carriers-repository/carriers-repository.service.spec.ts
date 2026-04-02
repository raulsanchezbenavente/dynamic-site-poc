import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { CarrierDTO, RepositoryResourcesService } from '@dcx/ui/api-layer';
import { CultureServiceEx, LoggerService, RepositoryService } from '@dcx/ui/libs';

import { CarriersRepositoryService } from './carriers-repository.service';

describe('CarriersRepositoryService', () => {
  let service: CarriersRepositoryService;
  let repositoryService: jasmine.SpyObj<RepositoryService>;
  let repositoryResources: jasmine.SpyObj<RepositoryResourcesService>;
  let cultureService: jasmine.SpyObj<CultureServiceEx>;
  let logger: jasmine.SpyObj<LoggerService>;

  const mockCarriers: CarrierDTO[] = [
    { name: 'Avianca', code: 'AV', externalUrl: 'https://avianca.com', logo: 'av-logo.png' },
    { name: 'LATAM', code: 'LA', externalUrl: 'https://latam.com', logo: 'la-logo.png' },
  ];

  beforeEach(() => {
    const repositoryServiceSpy = jasmine.createSpyObj('RepositoryService', ['getItem', 'setItem', 'removeItem']);
    const repositoryResourcesSpy = jasmine.createSpyObj('RepositoryResourcesService', ['getResource']);
    const cultureServiceSpy = jasmine.createSpyObj('CultureServiceEx', ['getCulture']);
    const loggerSpy = jasmine.createSpyObj('LoggerService', ['info', 'warn', 'error']);

    cultureServiceSpy.getCulture.and.returnValue('es-ES');

    TestBed.configureTestingModule({
      providers: [
        CarriersRepositoryService,
        { provide: RepositoryService, useValue: repositoryServiceSpy },
        { provide: RepositoryResourcesService, useValue: repositoryResourcesSpy },
        { provide: CultureServiceEx, useValue: cultureServiceSpy },
        { provide: LoggerService, useValue: loggerSpy },
      ],
    });

    service = TestBed.inject(CarriersRepositoryService);
    repositoryService = TestBed.inject(RepositoryService) as jasmine.SpyObj<RepositoryService>;
    repositoryResources = TestBed.inject(RepositoryResourcesService) as jasmine.SpyObj<RepositoryResourcesService>;
    cultureService = TestBed.inject(CultureServiceEx) as jasmine.SpyObj<CultureServiceEx>;
    logger = TestBed.inject(LoggerService) as jasmine.SpyObj<LoggerService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('ensureIfCarriersAreLoaded', () => {
    it('should complete successfully when carriers are already cached', (done) => {
      repositoryService.getItem.and.returnValue(of(mockCarriers));

      service.ensureCarriersAreLoaded('en-US').subscribe({
        complete: () => {
          expect(repositoryService.getItem).toHaveBeenCalledWith('carriers_en-us');
          expect(logger.info).toHaveBeenCalledWith(
            'CarriersRepositoryService',
            'loadCarriers',
            'Loading carriers for culture: en-US'
          );
          expect(logger.info).toHaveBeenCalledWith(
            'CarriersRepositoryService',
            'loadCarriers',
            'Carriers loaded from cache for culture: en-US'
          );
          done();
        },
      });
    });

    it('should fetch from API when cache is empty', (done) => {
      repositoryService.getItem.and.returnValue(of(null));
      repositoryResources.getResource.and.returnValue(
        of({ data: mockCarriers, resourceType: 'carriers', culture: 'en-US', metadata: { count: 2, generatedAt: '' } })
      );
      repositoryService.setItem.and.returnValue(of(undefined));

      service.ensureCarriersAreLoaded('en-US').subscribe({
        complete: () => {
          expect(repositoryResources.getResource).toHaveBeenCalledWith('carriers', { culture: 'en-US' });
          expect(repositoryService.setItem).toHaveBeenCalledWith('carriers_en-us', mockCarriers);
          done();
        },
      });
    });

    it('should use default culture when not specified', (done) => {
      repositoryService.getItem.and.returnValue(of(mockCarriers));

      service.ensureCarriersAreLoaded().subscribe({
        complete: () => {
          expect(cultureService.getCulture).toHaveBeenCalled();
          expect(repositoryService.getItem).toHaveBeenCalledWith('carriers_es-es');
          done();
        },
      });
    });

    it('should complete on error', (done) => {
      repositoryService.getItem.and.returnValue(throwError(() => new Error('Cache error')));

      service.ensureCarriersAreLoaded('en-US').subscribe({
        complete: () => {
          expect(logger.error).toHaveBeenCalledWith('[CarriersRepository]', jasmine.stringContaining('Error en ensureCarriersLoaded'));
          done();
        },
      });
    });

    it('should fetch from API when cached data is empty array', (done) => {
      repositoryService.getItem.and.returnValue(of([]));
      repositoryResources.getResource.and.returnValue(
        of({ data: mockCarriers, resourceType: 'carriers', culture: 'en-US', metadata: { count: 2, generatedAt: '' } })
      );
      repositoryService.setItem.and.returnValue(of(undefined));

      service.ensureCarriersAreLoaded('en-US').subscribe({
        complete: () => {
          expect(repositoryResources.getResource).toHaveBeenCalled();
          done();
        },
      });
    });

    it('should complete when API fetch fails', (done) => {
      repositoryService.getItem.and.returnValue(of(null));
      repositoryResources.getResource.and.returnValue(throwError(() => new Error('API error')));

      service.ensureCarriersAreLoaded('en-US').subscribe({
        complete: () => {
          expect(logger.error).toHaveBeenCalledWith(
            'CarriersRepositoryService',
            'loadAndCacheCarriers',
            jasmine.stringContaining('Error fetching or caching carriers')
          );
          done();
        },
      });
    });

    it('should convert culture code to lowercase in cache key', (done) => {
      repositoryService.getItem.and.returnValue(of(mockCarriers));

      service.ensureCarriersAreLoaded('EN-US').subscribe({
        complete: () => {
          expect(repositoryService.getItem).toHaveBeenCalledWith('carriers_en-us');
          done();
        },
      });
    });
  });

  describe('getCarriers', () => {
    it('should return carriers from cache mapped to CarrierVM', (done) => {
      repositoryService.getItem.and.returnValue(of(mockCarriers));

      service.getCarriers('en-US').subscribe({
        next: (result) => {
          expect(result.length).toBe(2);
          expect(result[0]).toEqual({
            name: 'Avianca',
            code: 'AV',
            externalUrl: 'https://avianca.com',
            logo: 'av-logo.png',
          });
          expect(result[1].name).toBe('LATAM');
          expect(repositoryService.getItem).toHaveBeenCalledWith('carriers_en-us');
          done();
        },
      });
    });

    it('should return empty array when cache is empty', (done) => {
      repositoryService.getItem.and.returnValue(of(null));

      service.getCarriers('en-US').subscribe({
        next: (result) => {
          expect(result).toEqual([]);
          expect(logger.warn).toHaveBeenCalledWith(
            'CarriersRepositoryService',
            'getCarriers',
            'No carriers found in cache for culture: en-US'
          );
          done();
        },
      });
    });

    it('should return empty array when cached data is empty array', (done) => {
      repositoryService.getItem.and.returnValue(of([]));

      service.getCarriers('en-US').subscribe({
        next: (result) => {
          expect(result).toEqual([]);
          expect(logger.warn).toHaveBeenCalled();
          done();
        },
      });
    });

    it('should use default culture when not specified', (done) => {
      repositoryService.getItem.and.returnValue(of(mockCarriers));

      service.getCarriers().subscribe({
        next: () => {
          expect(cultureService.getCulture).toHaveBeenCalled();
          expect(repositoryService.getItem).toHaveBeenCalledWith('carriers_es-es');
          done();
        },
      });
    });

    it('should return empty array on error', (done) => {
      repositoryService.getItem.and.returnValue(throwError(() => new Error('Cache error')));

      service.getCarriers('en-US').subscribe({
        next: (result) => {
          expect(result).toEqual([]);
          expect(logger.error).toHaveBeenCalledWith(
            'CarriersRepositoryService',
            'getCarriers',
            jasmine.stringContaining('Error retrieving carriers from cache')
          );
          done();
        },
      });
    });

    it('should map all carrier properties correctly', (done) => {
      const detailedCarriers: CarrierDTO[] = [
        {
          name: 'Copa Airlines',
          code: 'CM',
          externalUrl: 'https://copa.com',
          logo: 'copa-logo.png',
        },
      ];
      repositoryService.getItem.and.returnValue(of(detailedCarriers));

      service.getCarriers('en-US').subscribe({
        next: (result) => {
          expect(result[0].name).toBe('Copa Airlines');
          expect(result[0].code).toBe('CM');
          expect(result[0].externalUrl).toBe('https://copa.com');
          expect(result[0].logo).toBe('copa-logo.png');
          done();
        },
      });
    });

    it('should handle multiple carriers correctly', (done) => {
      const manyCarriers: CarrierDTO[] = [
        { name: 'Carrier 1', code: 'C1', externalUrl: 'url1', logo: 'logo1' },
        { name: 'Carrier 2', code: 'C2', externalUrl: 'url2', logo: 'logo2' },
        { name: 'Carrier 3', code: 'C3', externalUrl: 'url3', logo: 'logo3' },
      ];
      repositoryService.getItem.and.returnValue(of(manyCarriers));

      service.getCarriers('en-US').subscribe({
        next: (result) => {
          expect(result.length).toBe(3);
          expect(result.map((c) => c.code)).toEqual(['C1', 'C2', 'C3']);
          done();
        },
      });
    });

    it('should convert culture code to lowercase in cache key', (done) => {
      repositoryService.getItem.and.returnValue(of(mockCarriers));

      service.getCarriers('PT-BR').subscribe({
        next: () => {
          expect(repositoryService.getItem).toHaveBeenCalledWith('carriers_pt-br');
          done();
        },
      });
    });
  });
});
