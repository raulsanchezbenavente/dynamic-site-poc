import { InjectionToken } from '@angular/core';

export const TIMEOUT_REDIRECT = new InjectionToken<string>('timeOutRedirect');
export const EXCLUDE_SESSION_EXPIRED_URLS = new InjectionToken<string[]>('excludedSessionExpiredUrls');
