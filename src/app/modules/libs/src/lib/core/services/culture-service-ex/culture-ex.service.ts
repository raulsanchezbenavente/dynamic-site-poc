import { Injectable } from '@angular/core';
import { WindowHelper } from '@dcx/ui/libs';

import { CULTURES, USER_CULTURES } from '../../../resources/cultures';
import { CultureConfig, UserCulture } from '../../models/culture';

@Injectable({
  providedIn: 'root',
})
export class CultureServiceEx {
  private readonly USER_CULTURES = USER_CULTURES;
  private cultureConfig: CultureConfig | undefined;
  public culture: string | undefined;

  constructor() {
    this.initializeCultureConfig();
  }

  private initializeCultureConfig(): void {
    this.cultureConfig = {
      default: CULTURES.default,
      supported: CULTURES.supported,
    };

    this.loadCulture();
  }

  private loadCulture(): void {
    const culture = this.getCultureByPriority();
    if (culture && this.isCultureSupported(culture)) {
      this.setCulture(culture);
    }
  }

  private getCultureByPriority(): string {
    if (!this.cultureConfig?.supported?.length) {
      return '';
    }

    const urlCulture = this.getCultureFromURL();
    if (urlCulture && this.isCultureSupported(urlCulture)) {
      return urlCulture;
    }

    const defaultCulture = this.getDefaultCulture();
    if (defaultCulture && this.isCultureSupported(defaultCulture)) {
      return defaultCulture;
    }

    return this.getFirstSupportedCulture();
  }

  private getDefaultCulture(): string {
    return this.cultureConfig?.default || '';
  }

  private getFirstSupportedCulture(): string {
    return this.cultureConfig?.supported?.[0] || '';
  }

  private isCultureSupported(culture: string): boolean {
    return this.cultureConfig?.supported?.includes(culture) || false;
  }

  public getCulture(): string {
    return this.culture || '';
  }

  public setCulture(cultureCode: string): void {
    if (cultureCode && this.isCultureSupported(cultureCode)) {
      this.culture = cultureCode;
    }
  }

  private getCultureFromURL(): string {
    const pathname = new URL(WindowHelper.getLocation().href).pathname;
    const pathParts = pathname.split('/').filter(Boolean);

    if (pathParts.length > 0) {
      const potentialCulture1 = pathParts[0];
      if (this.isCultureSupported(potentialCulture1)) {
        return potentialCulture1;
      }
    }

    if (pathParts.length > 1) {
      const potentialCulture2 = pathParts[1];
      if (this.isCultureSupported(potentialCulture2)) {
        return potentialCulture2;
      }
    }

    return '';
  }

  public getUserCulture(): UserCulture {
    return this.USER_CULTURES[this.getCulture()];
  }

  public getLanguageAndRegion(): string {
    const currentCulture = this.getCulture();
    const userCulture = this.USER_CULTURES[currentCulture];

    if (userCulture?.locale) {
      return userCulture.locale;
    }

    return '';
  }

  public getSupportedCultures(): string[] {
    return this.cultureConfig?.supported || Object.keys(this.USER_CULTURES);
  }
}
