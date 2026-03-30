import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class CookiesStore {
  private readonly store = new Map<string, unknown>();

  public getCookie(key: string): unknown {
    return this.store.get(key);
  }

  public setCookie(key: string, data: unknown): void {
    this.store.set(key, data);
  }

  public removeCookie(key: string): void {
    this.store.delete(key);
  }

  public cleanCookies(): void {
    this.store.clear();
  }
}
