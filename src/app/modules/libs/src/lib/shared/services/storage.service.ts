import { Injectable } from '@angular/core';
import { LocalStorageService, SessionStorageService } from 'angular-web-storage';

@Injectable({ providedIn: 'root' })
export class StorageService {
  constructor(
    private readonly localStorageService: LocalStorageService,
    private readonly sessionStorageService: SessionStorageService
  ) {}

  // tslint:disable-next-line: no-any
  public setLocalStorage(key: string, value: any, timeout: number = 0): void {
    if (value != null) {
      this.localStorageService.set(key, value, timeout, 't');
    }
  }

  public getLocalStorage(key: string): any {
    return this.localStorageService.get(key);
  }

  public removeAllLocalStorage(): void {
    this.localStorageService.clear();
  }

  public removeLocalStorage(key: string): void {
    this.localStorageService.remove(key);
  }

  public cleanLocalStorage(): void {
    this.localStorageService.clear();
  }

  // tslint:disable-next-line: no-any
  public setSessionStorage(key: string, value: any, timeout: number = 0): void {
    if (value != null) {
      this.sessionStorageService.set(key, value, timeout, 't');
    }
  }

  public getSessionStorage(key: string): any {
    return this.sessionStorageService.get(key);
  }

  public removeSessionStorage(key: string): void {
    this.sessionStorageService.remove(key);
  }

  public removeAllSessionStorage(): void {
    this.sessionStorageService.clear();
  }

  public cleanSessionStorage(): void {
    this.sessionStorageService.clear();
  }
}
