import { IbeEventRedirectType } from '@dcx/ui/libs';

export class RedirectServiceFake {
  public isExternalUrl(url: string): boolean {
    const regex = /^(http(s)?:\/\/(?:www\.|(?!www))|www\.|\/\/)\S+$/;
    return regex.test(url);
  }

  public validateEventRedirectType(url: string): IbeEventRedirectType {
    return this.isExternalUrl(url) ? IbeEventRedirectType.externalRedirect : IbeEventRedirectType.internalRedirect;
  }

  public getRedirectFromCurrentUrl(culture: string): string {
    const regex = /[a-z]{2}(?:-[a-z]{2,3}\b)(?!\.)/i;
    let curUrl = globalThis.location.href;
    const curCulture = regex.exec(curUrl);
    if (curCulture && curCulture.length > 0) {
      curUrl = curUrl.replace(curCulture[0], '{culture}');
    } else {
      curUrl += '{culture}/';
    }
    return curUrl;
  }

  public getRedirect(url: string, culture: string, cultureAlias?: Map<string, string>): string {
    return 'www.google.com';
  }
}
