/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
export class CookieServiceFake {
  public getCookie(key: string): string {
    return '';
  }

  public setCookie(key: string, data: any, time?: Date | undefined): void {
    throw new Error('Method not implemented.');
  }

  public removeCookie(key: string): void {
    throw new Error('Method not implemented.');
  }

  public cleanCookies(): void {
    throw new Error('Method not implemented.');
  }
}
