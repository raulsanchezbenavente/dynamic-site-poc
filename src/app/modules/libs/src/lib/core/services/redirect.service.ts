import { Injectable } from '@angular/core';

import { WindowHelper } from '../helpers/window-helper';

import { IbeEventRedirectType } from './../models/ibe-event-redirect-type';
import { CultureServiceEx } from './culture-service-ex/culture-ex.service';

@Injectable({ providedIn: 'root' })
export class RedirectService {
  constructor(protected readonly cultureServiceEx: CultureServiceEx) {}

  public getRedirect(url: string, culture: string, cultureAlias?: Map<string, string>): string {
    culture = culture || this.cultureServiceEx.getCulture();
    if (cultureAlias) {
      const cultureFromAlias = cultureAlias.get(culture) ?? culture;
      culture = cultureFromAlias;
    }

    const domain = this.getDomain();
    let redirectUrl = url.replace('{culture}', culture).replace('[culture]', culture);
    redirectUrl = redirectUrl.replace('{currentDomain}', domain).replace('[currentDomain]', domain);
    return redirectUrl;
  }

  public getRedirectFromCurrentUrl(culture: string): string {
    const regex = /[a-z]{2}(?:-[a-z]{2,3}\b)(?!\.)/i;
    let curUrl = WindowHelper.getLocation().href;
    const curCulture = regex.exec(curUrl);
    if (curCulture && curCulture.length > 0) {
      curUrl = curUrl.replace(curCulture[0], '{culture}');
    } else {
      curUrl += '{culture}/';
    }
    return this.getRedirect(curUrl, culture);
  }

  public isExternalUrl(url: string): boolean {
    const regex = /^(http(s)?:\/\/(?:www\.|(?!www))|www\.|\/\/)\S+$/;
    return regex.test(url);
  }

  public validateEventRedirectType(url: string): IbeEventRedirectType {
    return this.isExternalUrl(url) ? IbeEventRedirectType.externalRedirect : IbeEventRedirectType.internalRedirect;
  }

  protected getDomain(): string {
    return WindowHelper.getLocation().host.split('.').splice(-2, 2).join('.');
  }
}
