import {
  clone,
  type Country,
  type DictionaryType,
  type IManageCountriesStrategy,
  type ManageCountriesStrategyOrder,
  OptionsList,
} from '@dcx/ui/libs';

import { MOCK_STATIONS_VM } from '../models';
import { BUSINESS_CONFIG_MOCK } from '../models/business-config-fake';

export class ManageCountriesServiceFake {
  businessConfig = BUSINESS_CONFIG_MOCK;
  private strategies: IManageCountriesStrategy[] = [];

  public getCountryImageSrc(countries: Country[]): void {
    const path = this.businessConfig.manageCountries.assetsPath
      ? this.businessConfig.path_CDN + this.businessConfig.manageCountries.assetsPath
      : '';

    countries.forEach((country) => {
      country.image = path.replace('{country.code}', country.code.toLowerCase());
    });
  }

  public getProcessedCountries(
    countries: Country[],
    culture: string,
    translations?: string[] | DictionaryType
  ): Country[] {
    countries.forEach((country) => {
      country.name = this.getCountryNameTranslation(country, culture, translations);
    });

    if (this.businessConfig.manageCountries?.enableFlags) {
      this.getCountryImageSrc(countries);
    }

    const newCountryList = this.processedCountries(countries);
    return newCountryList;
  }

  public mapCountriesToSelectOption(
    countries: Country[],
    culture: string,
    translations?: string[] | DictionaryType
  ): OptionsList[] {
    countries.forEach((country) => {
      country.name = this.getCountryNameTranslation(country, culture, translations);
    });

    if (this.businessConfig.manageCountries?.enableFlags) {
      this.getCountryImageSrc(countries);
    }

    const newCountryList = this.processedCountries(countries);

    return newCountryList.map((processedCountry) => ({
      code: processedCountry.code,
      name: processedCountry.name!,
      prefix: processedCountry.phonePrefix,
      isDefault: processedCountry.isDefault,
      isSelected: processedCountry.isSelected,
      image: processedCountry.image,
    }));
  }

  private getCountryNameTranslation(
    country: Country,
    culture: string,
    translations?: string[] | DictionaryType
  ): string {
    let languageValue = '';
    const translationValue =
      translations &&
      ((translations as any)['Country.' + country.code?.toUpperCase()] ||
        (translations as any)['Country.' + country.code?.toLowerCase()]);
    if (country.languages && Object.entries(country.languages).length !== 0) {
      languageValue =
        country.languages[(culture as any).substring(culture.indexOf('-') + 1).toLowerCase()] ||
        (country.languages as any)[culture];
    }
    return languageValue || translationValue || country.name;
  }

  public processedCountries(countries: Country[]): Country[] {
    const data: ManageCountriesStrategyOrder = {
      countries: clone(countries),
      maxOrderValue: 0,
    };
    this.strategies.forEach((strategy) => strategy.process(data));
    return data.countries;
  }
}

// Used for Search
export class SearchManageCountriesServiceFake {
  public mapCountriesToDeprecatedSelectOption(
    countries: Country[],
    culture: string,
    translations?: string[] | DictionaryType | undefined
  ): OptionsList[] {
    const options: OptionsList[] = [];
    MOCK_STATIONS_VM.forEach((country) => {
      const option: OptionsList = {
        code: country.countryCode,
        name: country.name,
        isSelected: false,
      };
      if (!options.map((x) => x.code).includes(option.code)) {
        options.push(option);
      }
    });
    return options;
  }
}
