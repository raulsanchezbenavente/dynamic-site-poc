import { inject, Injectable } from '@angular/core';
import { AccountV2Client } from '@dcx/module/api-clients';
import {
  AuthService,
  BROWSER_COUNTRY,
  BROWSER_LANGUAGE,
  BROWSER_REGION,
  CultureHelperService,
  CultureService,
  PointOfSaleService,
  UserCulture,
} from '@dcx/ui/libs';
import { take } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CutureConfigService {
  private readonly auth = inject(AuthService);
  private readonly pointOfSaleService = inject(PointOfSaleService);
  private readonly accountClientV2 = inject(AccountV2Client);
  private readonly cultureService = inject(CultureService);
  private readonly cultureHelper = inject(CultureHelperService);
  private readonly languageFallback = BROWSER_LANGUAGE;
  private readonly countryFallback = BROWSER_COUNTRY;
  private readonly regionFallback = BROWSER_REGION;

  public setInitialCulture(): void {
    const currency: string | undefined = this.pointOfSaleService.getCurrentPointOfSale()?.currency?.code;
    this.auth
      .isAuthenticatedKeycloak$()
      .pipe(take(1))
      .subscribe((isAuthenticated) => {
        if (isAuthenticated) {
          this.accountClientV2.sessionGET('2').subscribe((sessionResponse) => {
            console.debug('User is authenticated, session data:', sessionResponse);
            const language: string | undefined = sessionResponse.result?.data?.accountSettings?.language;
            const country: string | undefined = sessionResponse.result?.data?.nationality;
            const region: string | undefined = country;
            const culture: UserCulture = this.configureCulture({ language, country, region, currency });
            console.debug('Culture from user', culture);
            this.cultureService.setCulture(culture);
          });
        } else {
          console.debug('User is not authenticated, skipping session load');
          const culture: UserCulture = this.configureCulture({ currency });
          console.debug('Culture from default', culture);
          this.cultureService.setCulture(culture);
        }
      });
  }

  public configureCulture(options?: {
    language?: string;
    country?: string;
    region?: string;
    currency?: string;
  }): UserCulture {
    const cultureData = this.buildCultureFallback(options);
    const language = cultureData.language;
    const country = cultureData.country;
    const locale: string = `${language}-${country}`;

    return {
      language,
      shortDateFormat: this.cultureHelper.getShortDateFormat(locale),
      longDateFormat: this.cultureHelper.getLongDateFormat(locale),
      timeFormat: this.cultureHelper.getTimeFormat(locale),
      is24HourClock: this.cultureHelper.is24HourFormat(locale),
      firstDayOfWeek: this.cultureHelper.getFirstDayOfWeek(locale),
      decimalSeparator: this.cultureHelper.getDecimalSeparator(locale),
      thousandsSeparator: this.cultureHelper.getThousandsSeparator(locale),
      locale,
      region: cultureData.region,
      nameOrder: this.cultureHelper.getNameOrder(locale),
      currency: cultureData.currency,
      direction: this.cultureHelper.getDirection(locale),
    };
  }

  private buildCultureFallback(options?: { language?: string; country?: string; region?: string; currency?: string }): {
    language?: string;
    country?: string;
    region?: string;
    currency?: string;
  } {
    const language = options?.language?.toLowerCase() || this.languageFallback;
    const country = options?.country?.toUpperCase() || this.countryFallback;
    const region = options?.region?.toUpperCase() || this.regionFallback;
    const locale: string = `${language}-${country}`;
    const currency = options?.currency?.toUpperCase() || this.cultureHelper.getCurrencyFromLocale(locale);
    return { language, country, region, currency };
  }
}
