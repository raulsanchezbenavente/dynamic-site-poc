import type { ElementRef } from '@angular/core';
import type { DataModule, EndpointsConfiguration, MainConfig } from '@dcx/ui/libs';
import { Observable } from 'rxjs';

import { DATA_INITIAL_VALUE } from '../data/data-inital-value.fake';

export class ConfigServiceFake {
  private _config!: MainConfig;

  constructor() {
    // Fake data
    this._config = {
      staticConfigUrl: 'https://ns-cms-lite.newshore.es/umbraco/api/config/',
      staticTranslationUrl: 'https://ns-cms-lite.newshore.es/umbraco/api/translation/',
      showTools: true,
      isDevEnvironment: false,
      cacheTime: 20000,
      composerTimeout: 10000,
      fliptEnabled: false,
    };
  }

  public getBusinessModuleConfig<T>(): Observable<T> {
    return new Observable<T>((res) => {
      res.next(DATA_INITIAL_VALUE as T);
      res.complete();
    });
  }

  public getTranslationConfig<T>(): Observable<T> {
    return new Observable((res) => {
      res.next({} as T);
      res.complete();
    });
  }

  public getCommonConfig<T>(config: string): Observable<T> {
    return new Observable((res) => {
      res.next((this._config.staticConfigUrl + `getConfig?key=common_${config}`) as T);
      res.complete();
    });
  }

  public getDataModuleId(elementRef: ElementRef): DataModule {
    const RES: DataModule = {
      id: elementRef.nativeElement.localName,
      name: elementRef.nativeElement.localName,
      config: 'accordion config',
    };

    return RES;
  }

  public getEndpointsConfig(): EndpointsConfiguration {
    return {} as EndpointsConfiguration;
  }

  public getInstanceId(): string {
    return 'storybook-instance';
  }
}
