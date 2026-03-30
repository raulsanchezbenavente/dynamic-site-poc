import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ConfigService {
  public getInstanceId(): string {
    return 'storybook';
  }

  public getMainConfig(): { composerTimeout: number } {
    return { composerTimeout: 5000 };
  }
}
