import { Injectable } from '@angular/core';

import { IbeEventRedirectType } from '../models';

@Injectable({
  providedIn: 'root',
})
export class RedirectionService {
  public redirect(redirectType: IbeEventRedirectType, redirectUrl: string, target: string = null!): void {
    const domain = '//' + location.host;
    if (redirectType === IbeEventRedirectType.internalRedirect) {
      redirectUrl = location.protocol + domain + redirectUrl;
    }

    if (target) {
      globalThis.open(redirectUrl, target, 'noreferrer');
    } else {
      globalThis.location.href = redirectUrl;
    }
  }
}
