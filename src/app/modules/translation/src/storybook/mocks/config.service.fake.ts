/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { Injectable } from '@angular/core';

@Injectable()
export class ConfigServiceFake {
  public getMainConfig() {
    return {
      staticTranslationUrl: 'https://localhost:44392/umbraco/api/translation/',
    };
  }
}
