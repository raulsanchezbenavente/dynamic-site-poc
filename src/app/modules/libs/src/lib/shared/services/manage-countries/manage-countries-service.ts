import { inject, Inject, Injectable, Optional } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { BUSINESS_CONFIG } from '../../injection-tokens';
import { BusinessConfig, Country, DictionaryType } from '../../model';

import { ManageCountriesContextService } from './manage-countries-context-service';

@Injectable({ providedIn: 'root' })
export class ManageCountriesService {
  private readonly translateService = inject(TranslateService);
  private readonly manageCountriesContext = inject(ManageCountriesContextService);

  constructor(@Optional() @Inject(BUSINESS_CONFIG) protected businessConfig: BusinessConfig) {}

  public getProcessedCountries(countries: Country[], culture: string): Country[] {
    for (const country of countries) {
      country.name = this.getCountryNameTranslation(country, culture);
    }

    if (this.businessConfig.manageCountries?.enableFlags) {
      this.getCountryImageSrc(countries);
    }

    const newCountryList = this.manageCountriesContext.processedCountries(countries);

    return newCountryList;
  }

  public getCountryImageSrc(countries: Country[]): void {
    const path = this.businessConfig.manageCountries.assetsPath
      ? this.businessConfig.path_CDN + this.businessConfig.manageCountries.assetsPath
      : '';

    for (const country of countries) {
      country.image = path.replace('{country.code}', country.code.toLowerCase());
    }
  }

  private getCountryNameTranslation(country: Country, culture: string): string {
    let languageValue = '';
    const translationValue = this.translateService.instant('Country.' + country.code.toUpperCase());
    if (country.languages && Object.entries(country.languages).length !== 0) {
      languageValue = this.getTranslationByLanguage(country.languages, culture) ?? country.name;
    }
    return languageValue ?? translationValue;
  }

  private getTranslationByLanguage(languages: DictionaryType, langCode: string): string | undefined {
    const normalizedCode = langCode.toLowerCase();

    const match =
      Object.entries(languages).find(([key]) => key.toLowerCase() === normalizedCode) ??
      Object.entries(languages).find(([key]) => key.toLowerCase().startsWith(normalizedCode));

    return match?.[1];
  }
}
