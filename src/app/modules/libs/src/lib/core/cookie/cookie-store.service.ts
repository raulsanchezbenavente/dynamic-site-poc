import { Inject, Injectable, InjectionToken, Optional } from '@angular/core';
import { CookieService } from 'ngx-cookie';

export const TIME_EXPIRES_COOKIES = new InjectionToken<number>('timeExpiresCookies');

@Injectable({ providedIn: 'root' })
export class CookiesStore {
  private dateExpires = new Date();

  constructor(
    private readonly cookieService: CookieService,
    @Optional() @Inject(TIME_EXPIRES_COOKIES) timeExpiresCookies: number
  ) {
    this.dateExpires.setMinutes(this.dateExpires.getMinutes() + timeExpiresCookies / 60 + 60);
  }

  getCookie(key: string): any {
    return this.cookieService.getObject(key);
  }

  setCookie(key: string, data: any, time: Date = null!): void {
    if (data != null) {
      if (time) {
        this.dateExpires = time;
      }
      this.cookieService.putObject(key, data, { expires: this.dateExpires });
    }
  }

  removeCookie(key: string): void {
    this.cookieService.remove(key);
  }

  cleanCookies() {
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const vals = cookie.split('=');
      document.cookie = vals[0] + '=;expires=Thu, 21 Sep 1979 00:00:01 UTC;';
    }
  }
}
