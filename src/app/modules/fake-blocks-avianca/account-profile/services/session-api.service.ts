import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export type SessionApiResponse = {
  success?: boolean;
  result?: {
    result?: boolean;
    data?: SessionData;
  };
};

export type SessionData = {
  firstName?: string;
  middleName?: string;
  lastName?: string;
  gender?: string;
  nationality?: string;
  dateOfBirth?: string;
  addressLine?: string;
  customerNumber?: string;
  communicationChannels?: SessionChannel[];
  contacts?: SessionContact[];
  balance?: {
    lastUpdate?: string;
    lifemiles?: {
      amount?: number;
    };
  };
};

export type SessionChannel = {
  type?: string;
  info?: string;
  prefix?: string;
};

export type SessionContact = {
  type?: string;
  name?: {
    first?: string;
    middle?: string;
    last?: string;
  };
  channels?: SessionChannel[];
};

@Injectable({ providedIn: 'root' })
export class SessionApiService {
  private static readonly LOWERCASE_PARTICLES = new Set([
    'de',
    'del',
    'la',
    'las',
    'los',
    'y',
    'da',
    'das',
    'do',
    'dos',
    'van',
    'von',
    'di',
  ]);

  private readonly http = inject(HttpClient);
  private cachedSession: SessionData | null = null;
  private inFlightRequest: Promise<SessionData | null> | null = null;

  public formatPersonName(parts: Array<string | undefined>): string {
    return parts
      .map((part, index) => this.toTitleCaseNamePart(part, index === 0))
      .filter((part) => part.length > 0)
      .join(' ')
      .trim();
  }

  public formatSingleName(value: string | undefined): string {
    return this.toTitleCaseNamePart(value, true);
  }

  public getSessionData(forceRefresh = false): Promise<SessionData | null> {
    if (!forceRefresh && this.cachedSession) {
      return Promise.resolve(this.cachedSession);
    }

    if (!forceRefresh && this.inFlightRequest) {
      return this.inFlightRequest;
    }

    this.inFlightRequest = this.fetchSessionData()
      .then((data) => {
        this.cachedSession = data;
        return data;
      })
      .finally(() => {
        this.inFlightRequest = null;
      });

    return this.inFlightRequest;
  }

  private async fetchSessionData(): Promise<SessionData | null> {
    const urls = this.buildSessionUrls();

    for (const url of urls) {
      try {
        const response = await firstValueFrom(this.http.get<SessionApiResponse>(url));
        const data = response?.result?.data;
        if (data) {
          return data;
        }
      } catch {
        // Try next candidate URL.
      }
    }

    return null;
  }

  private buildSessionUrls(): string[] {
    const endpoint = '/accounts/api/v2/session';
    const urls = new Set<string>([endpoint]);
    const location = globalThis.location;

    if ((location?.port || '') !== '4300') {
      urls.add(`http://localhost:4300${endpoint}`);
    }

    if (location?.hostname === 'av-booking-local.newshore.es') {
      urls.add(`https://av-booking-local.newshore.es${endpoint}`);
    }

    return Array.from(urls);
  }

  private toTitleCaseNamePart(value: string | undefined, isFirstToken: boolean): string {
    const normalized = String(value || '')
      .trim()
      .replace(/\s+/g, ' ');

    if (!normalized) {
      return '';
    }

    const tokens = normalized.split(' ');
    return tokens
      .map((token, tokenIndex) => {
        const lowered = token.toLowerCase();
        const shouldKeepLowercase =
          (isFirstToken ? tokenIndex > 0 : true) && SessionApiService.LOWERCASE_PARTICLES.has(lowered);

        if (shouldKeepLowercase) {
          return lowered;
        }

        return this.capitalizeToken(lowered);
      })
      .join(' ');
  }

  private capitalizeToken(token: string): string {
    return token
      .split(/([\-'’])/)
      .map((piece) => {
        if (!piece || piece === '-' || piece === "'" || piece === '’') {
          return piece;
        }

        const [first = '', ...rest] = piece;
        return first.toUpperCase() + rest.join('');
      })
      .join('');
  }
}
