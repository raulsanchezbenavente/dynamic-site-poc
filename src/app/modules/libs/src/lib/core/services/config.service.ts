import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ConfigService {
  public getInstanceId(): string {
    return 'storybook';
  }

  public getMainConfig(): { composerTimeout: number; staticTranslationUrl: string } {
    return { composerTimeout: 5000, staticTranslationUrl: '' };
  }
}
