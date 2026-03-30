import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class CultureHelperService {
  public getShortDateFormat(localeISObcp47: string): string {
    const dtf = new Intl.DateTimeFormat(localeISObcp47, { day: '2-digit', month: '2-digit', year: 'numeric' });
    return dtf
      .formatToParts(0)
      .map((p) => {
        let token = p.value;
        if (p.type === 'day') {
          token = 'DD';
        } else if (p.type === 'month') {
          token = 'MM';
        } else if (p.type === 'year') {
          token = 'YYYY';
        }
        return token;
      })
      .join('');
  }
}
