/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
export class CookieServiceFake {
  public getCookie(key: string): { posCode: string } {
    return {
      posCode: 'POS1',
    };
  }

  public setCookie(key: string, data: any, time?: Date | undefined): void {}

  public removeCookie(key: string): void {
    throw new Error('Method not implemented.');
  }

  public cleanCookies(): void {
    throw new Error('Method not implemented.');
  }
}
