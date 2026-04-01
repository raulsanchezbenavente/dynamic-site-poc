import { Injectable } from '@angular/core';

import { CookieOptions } from '../../models/cookies/cookies-options.enum';

@Injectable({ providedIn: 'root' })
export class CookieService {
  public set(name: string, value: string, opts: CookieOptions = {}): void {
    const enc = (v: string): string => encodeURIComponent(v);
    const parts = [`${enc(name)}=${enc(value)}`];

    const path = opts.path ?? '/';
    parts.push(`path=${path}`);

    if (opts.domain) parts.push(`domain=${opts.domain}`);
    if (opts.expires) parts.push(`expires=${opts.expires.toUTCString()}`);
    if (typeof opts.maxAge === 'number') parts.push(`max-age=${Math.floor(opts.maxAge)}`);

    const sameSite = opts.sameSite ?? 'Lax';
    parts.push(`samesite=${sameSite}`);

    const secure =
      opts.secure ?? ((typeof location !== 'undefined' && location.protocol === 'https:') || sameSite === 'None');
    if (secure) parts.push('secure');

    document.cookie = parts.join('; ');
  }

  public get(name: string): string | null {
    const encName = encodeURIComponent(name) + '=';
    const cookies = document.cookie ? document.cookie.split('; ') : [];
    for (const c of cookies) {
      if (c.startsWith(encName)) {
        return decodeURIComponent(c.substring(encName.length));
      }
    }
    return null;
  }

  public has(name: string): boolean {
    return this.get(name) !== null;
  }

  public getAll(): Record<string, string> {
    const out: Record<string, string> = {};
    const pairs = document.cookie ? document.cookie.split('; ') : [];
    for (const p of pairs) {
      const idx = p.indexOf('=');
      const k = decodeURIComponent(p.substring(0, idx));
      const v = decodeURIComponent(p.substring(idx + 1));
      out[k] = v;
    }
    return out;
  }

  public delete(name: string, opts: Pick<CookieOptions, 'path' | 'domain'> = {}): void {
    this.set(name, '', {
      path: opts.path ?? '/',
      domain: opts.domain,
      expires: new Date('1970-01-01T00:00:00Z'),
      sameSite: 'Lax',
      secure: false,
    });
  }
}
