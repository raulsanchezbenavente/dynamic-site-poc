import { HttpClient } from '@angular/common/http';
import { ElementRef, Injectable } from '@angular/core';
import { forkJoin, Observable } from 'rxjs';

import { BusinessConfig, CultureServiceEx, EndpointsConfiguration, PageTemplate } from '../../../public-api';
import { CommonConfig } from '../../common';
import { DataModule } from '../models/data-module';
import { MainConfig } from '../models/main-config';

import { FliptService } from './flipt.service';
import { LoggerService } from './logger.service';
import { RepositoryService } from './repository.service';

/**
 * Config Service - Under Construction...
 * IBE+
 */
@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  private _config!: MainConfig;
  private _endpointsConfiguration!: EndpointsConfiguration;
  private _businessConfig!: BusinessConfig;
  private _templateConfig!: PageTemplate[];
  private _instanceId!: string;

  constructor(
    private readonly _httpClient: HttpClient,
    private readonly _logger: LoggerService,
    private readonly _repositoryService: RepositoryService,
    private readonly _cultureServiceEx: CultureServiceEx,
    private readonly _flipService: FliptService
  ) {}

  /**
   * Allow to parse the CMS data-initial-value and return a typed config object
   * @elementRef the HTML main div of the component
   * @returns The type object parsed
   */
  public parseInitialValue<T>(elementRef: ElementRef): T {
    return JSON.parse(elementRef.nativeElement.dataset['initialValue']) as T;
  }

  /**
   * Get main settings before app initialization
   * @returns
   */
  public init(): Observable<unknown> {
    return new Observable((result) => {
      this.initConfig().subscribe(() => {
        forkJoin([this.setEndpointsConfiguration(), this.setBusinessConfig(), this.setTemplateConfig()]).subscribe(
          () => {
            result.next(undefined);
            result.complete();
          }
        );
      });
    });
  }

  /**
   * Get Business Config
   * @param config config key
   * @returns
   */
  public getBusinessModuleConfig<T>(config: string): Observable<T> {
    return new Observable((result) => {
      this.configHandler<T>(this.getBusinessConfigPath(config)).subscribe((res) => {
        result.next(res);
        result.complete();
      });
    });
  }

  /**
   * Get translation group
   * @param culture culture iso-code
   * @param key required key
   * @returns
   */
  public getTranslationConfig<T>(culture: string, key: string): Observable<T> {
    return new Observable((result) => {
      this.configHandler<T>(this.getTranslationConfigPath(culture, key)).subscribe({
        next: (res) => {
          result.next(res);
          result.complete();
        },
        error: () => {
          result.error();
          result.complete();
        },
      });
    });
  }

  /**
   * Get common configs
   * @param config required config
   * @returns
   */
  public getCommonConfig<T>(key: string): Observable<T> {
    return new Observable((result) => {
      this.configHandler<T>(this.getCommonConfigPath(key)).subscribe((res) => {
        result.next(res);
        result.complete();
      });
    });
  }

  /**
   * Get feature-related configs
   * @param key Feature or component key to retrieve its config
   * @returns
   */
  public getFeatureConfig<T>(key: string): Observable<T> {
    return new Observable((result) => {
      this.configHandler<T>(this.getFeatureConfigPath(key)).subscribe((res) => {
        result.next(res);
        result.complete();
      });
    });
  }

  /**
   * Get data module
   * @param elementRef
   * @returns
   */
  public getDataModuleId(elementRef: ElementRef): DataModule {
    const result: DataModule = {
      id: elementRef.nativeElement.dataset['moduleId'],
      name: elementRef.nativeElement.dataset['moduleName'],
      config: elementRef.nativeElement.dataset['moduleConfig'],
    };

    return result;
  }

  /**
   * Get Main Config
   * @returns
   */
  public getMainConfig(): MainConfig {
    return this._config;
  }

  /**
   * Get Instance Id
   * Used to provide compatibility between multiples runtimes on a MPA Approach
   * @returns
   */
  public getInstanceId(): string {
    return this._instanceId;
  }

  public getUrlFromMeta(): string {
    const url = new URL(import.meta.url);

    const path = url.origin === 'http://localhost:4200' ? '' : url.pathname.substring(0, url.pathname.lastIndexOf('/'));

    return url.origin + path;
  }

  /**
   * Return the endpoints configuration that was preloaded at initialization time
   * @returns
   */
  public getEndpointsConfig(): EndpointsConfiguration {
    return this._endpointsConfiguration;
  }

  /**
   * Return the business configuration object that was preloaded at initialization time
   */
  public getBusinessConfig(): BusinessConfig {
    return this._businessConfig;
  }

  /**
   * Config handler source implemented as a "FirstCache strategy"
   * If requested key exists on repository, returns it.
   * otherwise, send http request, store response and return result
   * @param path
   * @returns
   */
  public configHandler<T>(path: string): Observable<T> {
    return new Observable((result) => {
      this._repositoryService.getItem<T>(path).subscribe((res) => {
        if (res) {
          result.next(res);
          result.complete();
        } else {
          this.fetchAndCacheConfig<T>(path, result);
        }
      });
    });
  }

  private fetchAndCacheConfig<T>(path: string, result: any): void {
    this._httpClient.get<T>(path).subscribe({
      next: (v) => {
        if (this._config.isDevEnvironment) {
          result.next(v);
          result.complete();
        } else {
          this.cacheConfig<T>(path, v, result);
        }
      },
      error: (e) => {
        this._logger.error(ConfigService.name, this.configHandler.name, e);
        result.error();
        result.complete();
      },
    });
  }

  private cacheConfig<T>(path: string, value: T, result: any): void {
    this._repositoryService.setItem<T>(path, value).subscribe(() => {
      result.next(value);
      result.complete();
    });
  }

  /**
   * Build path to recover templates
   * SPA Feature
   * @param groupKey
   * @param culture
   * @returns
   */
  public getTemplateConfigPath(groupKey: string, culture?: string): string {
    let result = this._config.staticConfigUrl + `get?key=template_${groupKey}`;
    if (culture) {
      result += '_' + culture;
    }
    return result;
  }

  /**
   * Get template configs
   * SPA Feature
   * @param groupKey Group key to retrieve its config
   * @param culture culture iso-code
   * @returns
   */
  public getTemplateConfig<T>(groupKey: string, culture: string): Observable<T> {
    return new Observable((result) => {
      this.configHandler<T>(this.getTemplateConfigPath(groupKey, culture)).subscribe((res) => {
        result.next(res);
        result.complete();
      });
    });
  }

  /**
   * Return the available templates object that was preloaded at initialization time
   */
  public getTemplateDataConfig(): PageTemplate[] {
    return this._templateConfig;
  }

  /**
   * Set Instance Id (unique per window/tab)
   * Used to open BroadcastChannel in EventBusService
   */
  private setInstanceId(): void {
    const matches = document.querySelectorAll('IBE-ID');

    if (matches.length > 0) {
      this._instanceId = matches[0].getAttribute('ibe-id') as string;
    } else {
      this._instanceId = Date.now().toString();
    }
  }

  private getBusinessConfigPath(config: string): string {
    return this._config.staticConfigUrl + `get?key=${config}`;
  }

  private getTranslationConfigPath(culture: string, key: string): string {
    return this._config.staticTranslationUrl + `GetByCultureAndKeys?culture=${culture}&key=${key}`;
  }

  private getCommonConfigPath(key: string): string {
    return this._config.staticConfigUrl + `get?key=common_${key}`;
  }

  private getFeatureConfigPath(key: string): string {
    return this._config.staticConfigUrl + `get?key=feature_${key}`;
  }

  private initConfig(): Observable<unknown> {
    return new Observable((subscriber) => {
      this._httpClient.get<MainConfig>(this.getUrlFromMeta() + '/assets/config/config.json').subscribe({
        next: (v) => {
          this._config = v;
          this.setInstanceId();
          this._logger.enableLogs(this._config.showTools);
          this._repositoryService.setTTL(this._config?.cacheTime);

          this._repositoryService.validateCache().subscribe(() => {
            subscriber.next(undefined);
            subscriber.complete();
          });
        },
        error: (e) => {
          this._logger.error(ConfigService.name, this.init.name, e);

          subscriber.next(undefined);
          subscriber.complete();
        },
      });
    });
  }

  /**
   * Retrieve the endpoints configuration and set an instance field with it
   * @returns
   */
  private setEndpointsConfiguration(): Observable<unknown> {
    return new Observable((subscriber) => {
      this.getCommonConfig<EndpointsConfiguration>(CommonConfig.ENDPOINTS_CONFIGURATION).subscribe({
        next: (res) => {
          this._endpointsConfiguration = res;
          if (this._config.fliptEnabled) {
            this._flipService.init(res.fliptNamespace, res.fliptUrl).subscribe(() => {
              subscriber.next(undefined);
              subscriber.complete();
            });
          } else {
            subscriber.next(undefined);
            subscriber.complete();
          }
        },
        error: (e) => {
          this._logger.error(ConfigService.name, this.init.name, e);

          subscriber.next(undefined);
          subscriber.complete();
        },
      });
    });
  }

  /**
   * Retrieve the business configuration and set an instance field with it
   * @returns
   */
  private setBusinessConfig(): Observable<BusinessConfig> {
    return new Observable((subscriber) => {
      this.getCommonConfig<BusinessConfig>(CommonConfig.BUSINESS_CONFIG).subscribe({
        next: (res) => {
          this._businessConfig = res;
          subscriber.next(undefined!);
          subscriber.complete();
        },
        error: (e) => {
          this._logger.error(ConfigService.name, this.init.name, e);

          subscriber.next(undefined!);
          subscriber.complete();
        },
      });
    });
  }

  /**
   * Retrieve templates based on culture and set an instance field with it
   * SPA Feature
   * to do => service to
   * @returns
   */
  private setTemplateConfig(): Observable<unknown> {
    return new Observable((subscriber) => {
      const element = document.querySelector('body')!;
      if (element?.classList.contains('ibe-page')) {
        subscriber.next(undefined);
        subscriber.complete();
      } else {
        this.getTemplateConfig<PageTemplate[]>('all', this._cultureServiceEx.getCulture()).subscribe({
          next: (res) => {
            this._templateConfig = res;
            subscriber.next(undefined);
            subscriber.complete();
          },
          error: (e) => {
            this._logger.error('ConfigService', 'setTemplateConfig', e);
            subscriber.next(undefined);
            subscriber.complete();
          },
        });
      }
    });
  }
}
