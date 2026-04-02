/* eslint-disable @typescript-eslint/no-explicit-any */

import { Injectable, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';

declare const gtag: any;

@Injectable({
  providedIn: 'root',
})
export class AnalyticsGaGtmColivingRewriteService implements OnDestroy {
  private readonly SUFFIX_SIGNAL = '_S_U_F_F_I_X__A_N_A_L_Y_T_I_C_S__S_I_G_N_A_L_';
  private readonly unsubscribe$ = new Subject<void>();
  private enableAnalyticsRequestRewrite = false;

  constructor() {
    this.initializeAnalyticsRewrite();
  }

  public initGaGtmColiving(value: boolean): void {
    this.enableAnalyticsRequestRewrite = value;
  }

  public shouldApplyRewrite(url: string): boolean {
    return this.enableAnalyticsRequestRewrite && /google-analytics\.com/.test(url);
  }

  public gtagWithSuffix(typeParameter: string, eventName: string, data: any): void {
    gtag(typeParameter, `${eventName}${this.enableAnalyticsRequestRewrite ? this.SUFFIX_SIGNAL : ''}`, data);
  }

  public ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  private initializeAnalyticsRewrite(): void {
    const replaceSuffix = (text: string): string => text.replaceAll(this.SUFFIX_SIGNAL, '');
    this.overrideSendBeacon(replaceSuffix);
    this.overrideFetch(replaceSuffix);
  }

  private overrideSendBeacon(replaceSuffix: (text: string) => string): void {
    const originalSendBeacon = navigator.sendBeacon;
    navigator.sendBeacon = (url: string, data?: any): boolean => {
      if (this.shouldApplyRewrite(url)) {
        url = replaceSuffix(url);
        if (data && typeof data === 'string') {
          const listOfPayloads = data.split('\r\n').map(replaceSuffix);
          data = listOfPayloads.join('\r\n');
        }
      }
      return originalSendBeacon.apply(navigator, [url, data]);
    };
  }

  private overrideFetch(replaceSuffix: (text: string) => string): void {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
      let inputUrl: string;
      if (typeof input === 'string') {
        inputUrl = input;
      } else if (input instanceof URL) {
        inputUrl = input.toString();
      } else {
        inputUrl = input.url;
      }

      if (this.shouldApplyRewrite(inputUrl)) {
        if (typeof input === 'string' || input instanceof URL) {
          input = replaceSuffix(input.toString());
        } else if (input instanceof Request) {
          input = new Request(replaceSuffix(input.url), input);
        }
        if (init?.body && typeof init.body === 'string') {
          init = { ...init, body: replaceSuffix(init.body) };
        }
      }
      return originalFetch(input, init);
    };
  }
}
