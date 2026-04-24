import { Injectable } from '@angular/core';

import { Browser } from '../models/browsers.enum';

@Injectable({ providedIn: 'root' })
export class DetectionsService {
  private readonly rules: Array<[RegExp, Browser]> = [
    [/\bedg(?:e|ios)?\b|\bedg\//, Browser.Edge], // Edge, edg/, edgios
    [/\bopr\/|\bopera\b/, Browser.Opera], // Opera
    [/\bfirefox\b|\bfxios\b/, Browser.Firefox], // Firefox
    [/\btrident\/|\bmsie\b/, Browser.IE], // IE
    [/\bcrios\b|\bchrome\/\d+|\bchrome\b/, Browser.Chrome], // Chrome/CrIOS
    [/\bsafari\b/, Browser.Safari], // Safari
  ];
  public getBrowser(): Browser {
    const nav = typeof navigator === 'undefined' ? null : (navigator as any);
    if (!nav) {
      return Browser.Unknown;
    }

    const ua = String(nav.userAgent || '').toLowerCase();
    const uaData = (nav.userAgentData?.brands ?? []).map((b: any) => String(b.brand).toLowerCase()).join(' ');
    const haystack = `${uaData} ${ua}`;

    for (const [re, br] of this.rules) if (re.test(haystack)) return br;

    return Browser.Unknown;
  }
}
