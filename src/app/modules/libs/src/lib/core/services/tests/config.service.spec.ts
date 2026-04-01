import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { ConfigService } from '../config.service';
import { HttpClient } from '@angular/common/http';
import { LoggerService } from '../logger.service';
import { RepositoryService } from '../repository.service';
import { CultureServiceEx } from '../culture-service-ex/culture-ex.service';
import { FliptService } from '../flipt.service';
import { MainConfig } from '../../models/main-config';
import { ElementRef } from '@angular/core';
import { EndpointsConfiguration } from '../../models/endpoints-configuration';
import { PageTemplate } from '../../models/page-template/page-template';
import { BusinessConfig } from '../../../shared/model/environment/business-config.model';

describe('ConfigService', () => {
  let service: ConfigService;
  let httpMock: jasmine.SpyObj<HttpClient>;
  let loggerMock: jasmine.SpyObj<LoggerService>;
  let repoMock: jasmine.SpyObj<RepositoryService>;
  let cultureExMock: jasmine.SpyObj<CultureServiceEx>;
  let fliptMock: jasmine.SpyObj<FliptService>;

  beforeEach(() => {
    httpMock = jasmine.createSpyObj<HttpClient>('HttpClient', ['get']);
    loggerMock = jasmine.createSpyObj<LoggerService>('LoggerService', ['error', 'enableLogs']);
    repoMock = jasmine.createSpyObj<RepositoryService>(
      'RepositoryService',
      ['getItem', 'setItem', 'setTTL', 'validateCache']
    );
    cultureExMock = jasmine.createSpyObj<CultureServiceEx>('CultureServiceEx', ['getCulture']);
    fliptMock = jasmine.createSpyObj<FliptService>('FliptService', ['init']);

    TestBed.configureTestingModule({
      providers: [
        ConfigService,
        { provide: HttpClient, useValue: httpMock },
        { provide: LoggerService, useValue: loggerMock },
        { provide: RepositoryService, useValue: repoMock },
        { provide: CultureServiceEx, useValue: cultureExMock },
        { provide: FliptService, useValue: fliptMock },
      ],
    });

    service = TestBed.inject(ConfigService);
  });

  // Helpers
  function setConfig(partial: Partial<MainConfig>): void {
    (service as any)._config = {
      staticConfigUrl: 'https://config/',
      staticTranslationUrl: 'https://i18n/',
      cacheTime: 60,
      showTools: true,
      isDevEnvironment: false,
      fliptEnabled: false,
      ...partial,
    } as any;
  }

  describe('parseInitialValue', () => {
    it('should parse JSON from data-initialValue', () => {
      const el = document.createElement('div');
      el.dataset['initialValue'] = JSON.stringify({ foo: 'bar', n: 1 });
      const ref = new ElementRef(el);

      const result = service.parseInitialValue<{ foo: string; n: number }>(ref);

      expect(result).toEqual({ foo: 'bar', n: 1 });
    });
  });

  describe('getDataModuleId', () => {
    it('should read module dataset fields', () => {
      const el = document.createElement('div');
      el.dataset['moduleId'] = 'id-1';
      el.dataset['moduleName'] = 'ModuleName';
      el.dataset['moduleConfig'] = '{"x":1}';
      const ref = new ElementRef(el);

      const result = service.getDataModuleId(ref);

      expect(result).toEqual({
        id: 'id-1',
        name: 'ModuleName',
        config: '{"x":1}',
      });
    });
  });

  describe('configHandler', () => {
    it('should return cached value when present', (done) => {
      const path = 'https://config/get?key=test';
      const cached = { value: 123 };
      repoMock.getItem.and.returnValue(of(cached));

      service.configHandler<typeof cached>(path).subscribe((res) => {
        expect(repoMock.getItem).toHaveBeenCalledWith(path);
        expect(httpMock.get).not.toHaveBeenCalled();
        expect(res).toBe(cached);
        done();
      });
    });

    it('should fetch and cache when missing and not dev environment', (done) => {
      setConfig({ isDevEnvironment: false });
      const path = 'https://config/get?key=test';
      const fetched = { value: 999 };

      repoMock.getItem.and.returnValue(of(null));
      httpMock.get.and.returnValue(of(fetched));
      repoMock.setItem.and.returnValue(of(undefined as any));

      service.configHandler<typeof fetched>(path).subscribe((res) => {
        expect(repoMock.getItem).toHaveBeenCalledWith(path);
        expect(httpMock.get).toHaveBeenCalledWith(path);
        expect(repoMock.setItem).toHaveBeenCalledWith(path, fetched);
        expect(res).toEqual(fetched);
        done();
      });
    });

    it('should fetch without caching when dev environment', (done) => {
      setConfig({ isDevEnvironment: true });
      const path = 'https://config/get?key=test-dev';
      const fetched = { dev: true };

      repoMock.getItem.and.returnValue(of(null));
      httpMock.get.and.returnValue(of(fetched));

      service.configHandler<typeof fetched>(path).subscribe((res) => {
        expect(httpMock.get).toHaveBeenCalledWith(path);
        expect(repoMock.setItem).not.toHaveBeenCalled();
        expect(res).toEqual(fetched);
        done();
      });
    });

    it('should log and error on fetch error', (done) => {
      setConfig({});
      const path = 'https://config/get?key=error';
      repoMock.getItem.and.returnValue(of(null));
      httpMock.get.and.returnValue(throwError(() => new Error('fail')));

      service.configHandler<any>(path).subscribe({
        next: () => fail('expected error'),
        error: () => {
          expect(loggerMock.error).toHaveBeenCalled();
          done();
        },
      });
    });
  });

  describe('get*Config wrappers', () => {
    it('getBusinessModuleConfig should call configHandler with correct path', (done) => {
      setConfig({});
      const spy = spyOn(service, 'configHandler').and.returnValue(of('OK' as any));

      service.getBusinessModuleConfig<string>('MY_KEY').subscribe((res) => {
        expect(spy).toHaveBeenCalledWith('https://config/get?key=MY_KEY');
        expect(res).toBe('OK');
        done();
      });
    });

    it('getCommonConfig should use common_ prefix', (done) => {
      setConfig({});
      const spy = spyOn(service, 'configHandler').and.returnValue(of(42 as any));

      service.getCommonConfig<number>('something').subscribe((res) => {
        expect(spy).toHaveBeenCalledWith(
          'https://config/get?key=common_something'
        );
        expect(res).toBe(42);
        done();
      });
    });

    it('getFeatureConfig should use feature_ prefix', (done) => {
      setConfig({});
      const spy = spyOn(service, 'configHandler').and.returnValue(of('feature' as any));

      service.getFeatureConfig<string>('x').subscribe((res) => {
        expect(spy).toHaveBeenCalledWith(
          'https://config/get?key=feature_x'
        );
        expect(res).toBe('feature');
        done();
      });
    });

    it('getTemplateConfig should use template_ path', (done) => {
      setConfig({});
      const spy = spyOn(service, 'configHandler').and.returnValue(of(['tpl'] as any));

      service.getTemplateConfig<string[]>('group', 'es-ES').subscribe((res) => {
        expect(spy).toHaveBeenCalledWith(
          'https://config/get?key=template_group_es-ES'
        );
        expect(res).toEqual(['tpl']);
        done();
      });
    });
  });

  describe('init', () => {
    it('should call internal initializers and complete', (done) => {
      const initConfigSpy = spyOn<any>(service, 'initConfig').and.returnValue(of(undefined));
      const setEndpointsSpy = spyOn<any>(service, 'setEndpointsConfiguration').and.returnValue(of(undefined));
      const setBusinessSpy = spyOn<any>(service, 'setBusinessConfig').and.returnValue(of(undefined));
      const setTemplateSpy = spyOn<any>(service, 'setTemplateConfig').and.returnValue(of(undefined));

      service.init().subscribe({
        next: () => {
          expect(initConfigSpy).toHaveBeenCalled();
          expect(setEndpointsSpy).toHaveBeenCalled();
          expect(setBusinessSpy).toHaveBeenCalled();
          expect(setTemplateSpy).toHaveBeenCalled();
          done();
        },
        error: (e) => fail(e),
      });
    });
  });

  describe('initConfig (private)', () => {
    it('should load main config, set instance id, logger and cache, then validate cache', (done) => {
      const mainConfig: MainConfig = {
        staticConfigUrl: 'https://config/',
        staticTranslationUrl: 'https://i18n/',
        cacheTime: 100,
        showTools: true,
        isDevEnvironment: false,
        fliptEnabled: false,
      } as any;

      // Meta URL da igual; probamos sólo que construye la llamada correcta
      httpMock.get.and.returnValue(of(mainConfig));
      repoMock.validateCache.and.returnValue(of(undefined));

      // Añadimos un IBE-ID para comprobar instanceId
      const ibe = document.createElement('IBE-ID');
      ibe.setAttribute('ibe-id', 'test-instance');
      document.body.appendChild(ibe);

      (service as any)
        .initConfig()
        .subscribe(() => {
          expect((service as any)._config).toEqual(mainConfig);
          expect(loggerMock.enableLogs).toHaveBeenCalledWith(true);
          expect(repoMock.setTTL).toHaveBeenCalledWith(100);
          expect(repoMock.validateCache).toHaveBeenCalled();
          expect(service.getInstanceId()).toBe('test-instance');
          ibe.remove();
          done();
        });
    });

    it('should log error but still complete on failure', (done) => {
      httpMock.get.and.returnValue(throwError(() => new Error('fail')));

      (service as any)
        .initConfig()
        .subscribe(() => {
          expect(loggerMock.error).toHaveBeenCalled();
          done();
        });
    });
  });

  describe('setEndpointsConfiguration (private)', () => {
    it('should set endpoints and init flipt when enabled', (done) => {
      setConfig({ fliptEnabled: true });

      const endpoints: EndpointsConfiguration = {
        fliptNamespace: 'ns',
        fliptUrl: 'https://flipt',
      } as any;

      spyOn(service, 'getCommonConfig').and.returnValue(of(endpoints));
      fliptMock.init.and.returnValue(of(undefined));

      (service as any)
        .setEndpointsConfiguration()
        .subscribe(() => {
          expect((service as any)._endpointsConfiguration).toBe(endpoints);
          expect(fliptMock.init).toHaveBeenCalledWith(
            'ns',
            'https://flipt'
          );
          done();
        });
    });

    it('should not init flipt when disabled', (done) => {
      setConfig({ fliptEnabled: false });

      const endpoints: EndpointsConfiguration = {
        fliptNamespace: 'ns',
        fliptUrl: 'https://flipt',
      } as any;

      spyOn(service, 'getCommonConfig').and.returnValue(of(endpoints));

      (service as any)
        .setEndpointsConfiguration()
        .subscribe(() => {
          expect((service as any)._endpointsConfiguration).toBe(endpoints);
          expect(fliptMock.init).not.toHaveBeenCalled();
          done();
        });
    });
  });

  describe('setBusinessConfig (private)', () => {
    it('should set business config', (done) => {
      const bc: BusinessConfig = { name: 'x' } as any;
      spyOn(service, 'getCommonConfig').and.returnValue(of(bc));

      (service as any)
        .setBusinessConfig()
        .subscribe(() => {
          expect(service.getBusinessConfig()).toBe(bc);
          done();
        });
    });
  });

  describe('setTemplateConfig (private)', () => {
    it('should skip when body has ibe-page class', (done) => {
      document.body.classList.add('ibe-page');
      cultureExMock.getCulture.and.returnValue('es-ES');

      const tplSpy = spyOn(service, 'getTemplateConfig');

      (service as any)
        .setTemplateConfig()
        .subscribe(() => {
          expect(tplSpy).not.toHaveBeenCalled();
          document.body.classList.remove('ibe-page');
          done();
        });
    });

    it('should load templates when body is not ibe-page', (done) => {
      cultureExMock.getCulture.and.returnValue('es-ES');

      const templates: PageTemplate[] = [{ id: 't1' } as any];
      spyOn(service, 'getTemplateConfig').and.returnValue(of(templates));

      (service as any)
        .setTemplateConfig()
        .subscribe(() => {
          expect(service.getTemplateDataConfig()).toBe(templates);
          done();
        });
    });
  });
});
