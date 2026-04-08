import type { ElementRef } from '@angular/core';
import type { DataModule, MainConfig } from '@dcx/ui/libs';
import { Observable } from 'rxjs';

import { DATA_INITIAL_VALUE } from '../data/data-inital-value.fake';

export class ConfigServiceFake {
  private readonly _config!: MainConfig;

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

  private createObservable<T>(value: T): Observable<T> {
    return new Observable<T>((res) => {
      res.next(value);
      res.complete();
    });
  }

  public getBusinessModuleConfig<T>(): Observable<T> {
    return this.createObservable(DATA_INITIAL_VALUE as T);
  }

  public getTranslationConfig<T>(): Observable<T> {
    return this.createObservable({} as T);
  }

  public getCommonConfig<T>(config: string): Observable<T> {
    return this.createObservable((this._config.staticConfigUrl + `getConfig?key=common_${config}`) as T);
  }

  public getDataModuleId(elementRef: ElementRef): DataModule {
    const RESULT_DATA: DataModule = {
      id: elementRef.nativeElement.localName,
      name: elementRef.nativeElement.localName,
      config: 'accordion config',
    };

    return RESULT_DATA;
  }

  public getInstanceId(): string {
    return 'storybook-instance';
  }
}
