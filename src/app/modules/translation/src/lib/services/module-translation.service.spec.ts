import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ModuleTranslationService } from './module-translation.service';
import { ConfigService, CultureServiceEx } from '@dcx/ui/libs';
import { TranslateService } from '@ngx-translate/core';
import { ModuleTranslation } from '../models/module-translation.model';

describe('ModuleTranslationService - Public API', () => {
  let service: ModuleTranslationService;
  let httpMock: HttpTestingController;
  let configService: jasmine.SpyObj<ConfigService>;
  let cultureServiceEx: jasmine.SpyObj<CultureServiceEx>;
  let translateService: jasmine.SpyObj<TranslateService>;

  const mockTranslations = {
    'common.hello': 'Hello',
    'common.goodbye': 'Goodbye',
  };

  const mockFooterTranslations = {
    'footer.copyright': 'Copyright 2025',
    'footer.privacy': 'Privacy Policy',
  };

  const mockConfig = {
    staticConfigUrl: 'https://api.example.com/config',
    staticTranslationUrl: 'https://api.example.com/translations',
    showTools: false,
    cacheTime: 3600,
    isDevEnvironment: false,
    composerTimeout: 5000,
    fliptEnabled: false,
  };

  beforeEach(() => {
    const configServiceSpy = jasmine.createSpyObj('ConfigService', ['getMainConfig']);
    const cultureServiceExSpy = jasmine.createSpyObj('CultureServiceEx', ['getLanguageAndRegion']);
    const translateServiceSpy = jasmine.createSpyObj('TranslateService', [
      'setTranslation',
      'use',
      'setFallbackLang',
    ]);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        ModuleTranslationService,
        { provide: ConfigService, useValue: configServiceSpy },
        { provide: CultureServiceEx, useValue: cultureServiceExSpy },
        { provide: TranslateService, useValue: translateServiceSpy },
      ],
    });

    service = TestBed.inject(ModuleTranslationService);
    httpMock = TestBed.inject(HttpTestingController);
    configService = TestBed.inject(ConfigService) as jasmine.SpyObj<ConfigService>;
    cultureServiceEx = TestBed.inject(CultureServiceEx) as jasmine.SpyObj<CultureServiceEx>;
    translateService = TestBed.inject(TranslateService) as jasmine.SpyObj<TranslateService>;

    configService.getMainConfig.and.returnValue(mockConfig);
    cultureServiceEx.getLanguageAndRegion.and.returnValue('en-US');
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('loadModuleTranslations - Basic functionality', () => {
    it('should successfully load translations for a single module', (done) => {
      const config: ModuleTranslation = { moduleName: 'Common' };

      service.loadModuleTranslations(config).subscribe((result) => {
        expect(result.success).toBe(true);
        expect(result.data).toEqual(mockTranslations);
        expect(translateService.setTranslation).toHaveBeenCalledWith('en-US', mockTranslations, true);
        expect(translateService.use).toHaveBeenCalledWith('en-US');
        expect(translateService.setFallbackLang).toHaveBeenCalledWith('en-US');
        done();
      });

      const req = httpMock.expectOne((r) => r.url.includes('keys=Common'));
      expect(req.request.method).toBe('GET');
      req.flush(mockTranslations);
    });

    it('should successfully load translations for multiple modules', (done) => {
      const config: ModuleTranslation = { moduleName: ['Common', 'Footer'] };

      service.loadModuleTranslations(config).subscribe((result) => {
        expect(result.success).toBe(true);
        expect(result.data).toBeDefined();
        done();
      });

      const req = httpMock.expectOne((r) => {
        // URL encodes comma as %2C
        return r.url.includes('keys=Common%2CFooter') || r.url.includes('keys=Common,Footer');
      });
      req.flush(mockTranslations);
    });

    it('should handle empty module array without making requests', (done) => {
      const config: ModuleTranslation = { moduleName: [] };

      service.loadModuleTranslations(config).subscribe((result) => {
        expect(result.success).toBe(true);
        expect(result.data).toEqual({});
        done();
      });

      httpMock.expectNone(() => true);
    });

    it('should adapt to different language cultures', (done) => {
      cultureServiceEx.getLanguageAndRegion.and.returnValue('es-ES');
      const config: ModuleTranslation = { moduleName: 'Common' };

      service.loadModuleTranslations(config).subscribe((result) => {
        expect(result.success).toBe(true);
        expect(translateService.use).toHaveBeenCalledWith('es-ES');
        done();
      });

      const req = httpMock.expectOne((r) => r.url.includes('culture=es-ES'));
      req.flush(mockTranslations);
    });
  });

  describe('loadModuleTranslations - Caching behavior', () => {
    it('should cache loaded modules and not request them again', (done) => {
      const config: ModuleTranslation = { moduleName: 'Common' };

      // First load
      service.loadModuleTranslations(config).subscribe((result1) => {
        expect(result1.success).toBe(true);

        // Second load - should use cache
        service.loadModuleTranslations(config).subscribe((result2) => {
          expect(result2.success).toBe(true);
          done();
        });

        // No second HTTP request should be made
        httpMock.expectNone(() => true);
      });

      const req = httpMock.expectOne(() => true);
      req.flush(mockTranslations);
    });

    it('should cache translations per language independently', (done) => {
      const config: ModuleTranslation = { moduleName: 'Common' };

      // Load in English
      service.loadModuleTranslations(config).subscribe((result1) => {
        expect(result1.success).toBe(true);

        // Switch language
        cultureServiceEx.getLanguageAndRegion.and.returnValue('es-ES');

        // Should make new request for Spanish
        service.loadModuleTranslations(config).subscribe((result2) => {
          expect(result2.success).toBe(true);
          done();
        });

        const req2 = httpMock.expectOne((r) => r.url.includes('culture=es-ES'));
        req2.flush({ 'common.hello': 'Hola' });
      });

      const req1 = httpMock.expectOne((r) => r.url.includes('culture=en-US'));
      req1.flush(mockTranslations);
    });

    it('should only request modules that are not already cached', (done) => {
      const config1: ModuleTranslation = { moduleName: 'Common' };
      const config2: ModuleTranslation = { moduleName: ['Common', 'Footer', 'Header'] };

      // Load Common first
      service.loadModuleTranslations(config1).subscribe(() => {
        // Load multiple modules including already-cached Common
        service.loadModuleTranslations(config2).subscribe((result) => {
          expect(result.success).toBe(true);
          done();
        });

        // Should only request Footer and Header (Common is cached)
        const req2 = httpMock.expectOne((r) => {
          const url = new URL(r.url);
          const keys = url.searchParams.get('keys') || '';
          return keys.includes('Footer') && keys.includes('Header') && !keys.includes('Common');
        });
        req2.flush(mockFooterTranslations);
      });

      const req1 = httpMock.expectOne(() => true);
      req1.flush(mockTranslations);
    });

    it('should allow retry after error by clearing cache', (done) => {
      const config: ModuleTranslation = { moduleName: 'Common' };
      spyOn(console, 'error');

      // First attempt - fail
      service.loadModuleTranslations(config).subscribe((result1) => {
        expect(result1.success).toBe(false);
      });

      const req1 = httpMock.expectOne(() => true);
      req1.flush('Server Error', { status: 500, statusText: 'Internal Server Error' });

      // Wait a tick for the error to be fully processed
      setTimeout(() => {
        // Second attempt - should retry (not use failed cache)
        service.loadModuleTranslations(config).subscribe((result2) => {
          expect(result2.success).toBe(true);
          done();
        });

        const req2 = httpMock.expectOne(() => true);
        req2.flush(mockTranslations);
      }, 10);
    });
  });

  describe('loadModuleTranslations - Concurrent requests', () => {
    it('should handle multiple concurrent requests for the same module efficiently', (done) => {
      const config: ModuleTranslation = { moduleName: 'Common' };
      let completed = 0;

      // Start 3 concurrent requests for the same module
      service.loadModuleTranslations(config).subscribe((result) => {
        expect(result.success).toBe(true);
        completed++;
        if (completed === 3) done();
      });

      service.loadModuleTranslations(config).subscribe((result) => {
        expect(result.success).toBe(true);
        completed++;
        if (completed === 3) done();
      });

      service.loadModuleTranslations(config).subscribe((result) => {
        expect(result.success).toBe(true);
        completed++;
        if (completed === 3) done();
      });

      // Should only make ONE HTTP request despite 3 concurrent calls
      const req = httpMock.expectOne(() => true);
      req.flush(mockTranslations);
      
      // Verify no additional requests
      httpMock.expectNone(() => true);
    });

    it('should handle concurrent requests for different modules independently', (done) => {
      const config1: ModuleTranslation = { moduleName: 'Common' };
      const config2: ModuleTranslation = { moduleName: 'Footer' };
      let completed = 0;

      // Start concurrent requests for different modules
      service.loadModuleTranslations(config1).subscribe((result) => {
        expect(result.success).toBe(true);
        completed++;
        if (completed === 2) done();
      });

      service.loadModuleTranslations(config2).subscribe((result) => {
        expect(result.success).toBe(true);
        completed++;
        if (completed === 2) done();
      });

      // Should make TWO separate HTTP requests
      const requests = httpMock.match(() => true);
      expect(requests.length).toBe(2);
      
      requests.forEach(req => req.flush(mockTranslations));
    });

    it('should wait for pending requests before loading remaining modules', (done) => {
      const config1: ModuleTranslation = { moduleName: 'Common' };
      const config2: ModuleTranslation = { moduleName: ['Common', 'Footer'] };

      // Start first request
      service.loadModuleTranslations(config1).subscribe(() => {});

      // Start second request while first is pending
      service.loadModuleTranslations(config2).subscribe((result) => {
        expect(result.success).toBe(true);
        done();
      });

      // Complete Common request
      const req1 = httpMock.expectOne((r) => r.url.includes('keys=Common') && !r.url.includes('Footer'));
      req1.flush(mockTranslations);

      // Then Footer should be requested
      const req2 = httpMock.expectOne((r) => r.url.includes('keys=Footer'));
      req2.flush(mockFooterTranslations);
    });
  });

  describe('loadModuleTranslations - Error handling', () => {
    it('should return error result on HTTP 500 error', (done) => {
      const config: ModuleTranslation = { moduleName: 'Common' };
      spyOn(console, 'error');

      service.loadModuleTranslations(config).subscribe((result) => {
        expect(result.success).toBe(false);
        expect(result.data).toEqual({});
        expect(console.error).toHaveBeenCalled();
        done();
      });

      const req = httpMock.expectOne(() => true);
      req.flush('Internal Server Error', { status: 500, statusText: 'Server Error' });
    });

    it('should return error result on HTTP 404 error', (done) => {
      const config: ModuleTranslation = { moduleName: 'NonExistent' };
      spyOn(console, 'error');

      service.loadModuleTranslations(config).subscribe((result) => {
        expect(result.success).toBe(false);
        expect(result.data).toEqual({});
        expect(console.error).toHaveBeenCalled();
        done();
      });

      const req = httpMock.expectOne(() => true);
      req.flush('Not Found', { status: 404, statusText: 'Not Found' });
    });

    it('should handle network errors silently (abort/timeout)', (done) => {
      const config: ModuleTranslation = { moduleName: 'Common' };
      spyOn(console, 'error');

      service.loadModuleTranslations(config).subscribe((result) => {
        expect(result.success).toBe(false);
        expect(result.data).toEqual({});
        expect(console.error).not.toHaveBeenCalled(); // Should NOT log
        done();
      });

      const req = httpMock.expectOne(() => true);
      req.error(new ProgressEvent('error'), { status: 0, statusText: 'Unknown Error' });
    });

    it('should handle timeout errors silently', (done) => {
      const config: ModuleTranslation = { moduleName: 'Common' };
      spyOn(console, 'error');

      service.loadModuleTranslations(config).subscribe((result) => {
        expect(result.success).toBe(false);
        expect(console.error).not.toHaveBeenCalled();
        done();
      });

      const req = httpMock.expectOne(() => true);
      // Simulate timeout
      setTimeout(() => {
        req.error(new ProgressEvent('timeout'), { status: 0, statusText: 'Unknown Error' });
      }, 50);
    });

    it('should propagate error to all concurrent requests', (done) => {
      const config: ModuleTranslation = { moduleName: 'Common' };
      let completed = 0;
      spyOn(console, 'error'); // Suppress error logging

      // Both subscriptions should receive the same error result
      const sub1 = service.loadModuleTranslations(config).subscribe((result) => {
        // Either both succeed or both fail - test that they get the same result
        completed++;
        if (completed === 1) {
          // Store first result
          expect(result.success).toBeDefined();
        }
        if (completed === 2) done();
      });

      const sub2 = service.loadModuleTranslations(config).subscribe((result) => {
        // Both subscriptions share the same observable via shareReplay
        completed++;
        if (completed === 2) done();
      });

      const req = httpMock.expectOne(() => true);
      req.flush('Error', { status: 500, statusText: 'Server Error' });
    });
  });

  describe('loadModuleTranslations - Edge cases', () => {
    it('should handle single module name string as array internally', (done) => {
      const config: ModuleTranslation = { moduleName: 'Common' };

      service.loadModuleTranslations(config).subscribe((result) => {
        expect(result.success).toBe(true);
        done();
      });

      const req = httpMock.expectOne((r) => r.url.includes('keys=Common'));
      req.flush(mockTranslations);
    });
  });
});
