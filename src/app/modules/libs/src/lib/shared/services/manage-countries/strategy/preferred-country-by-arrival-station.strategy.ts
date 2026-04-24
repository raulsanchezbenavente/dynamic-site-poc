import { Injectable } from '@angular/core';

import { ManageCountriesTypeEnum } from '../../../enums';
import { urlHelpers } from '../../../helpers';
import { IManageCountriesStrategy } from '../../../interfaces';
import { Country, ManageCountriesStrategyOrder, Station } from '../../../model';
import { SessionStore } from '../../../session';
import { StorageService } from '../../storage.service';

@Injectable()
export class PreferredCountryByArrivalStationStrategy implements IManageCountriesStrategy {
  public name: ManageCountriesTypeEnum;

  constructor(
    protected storageService: StorageService,
    protected sessionStore: SessionStore
  ) {
    this.name = ManageCountriesTypeEnum.PREFERRED_COUNTRIES_BY_ARRIVAL_STATION_STRATEGY;
  }

  public process(data: ManageCountriesStrategyOrder): Country[] {
    const currentJourneys = this.sessionStore.getSession().session.booking.journeys;

    if (currentJourneys.length === 0) {
      return this.sortCountries(data.countries);
    }

    const arrivalStationCode = currentJourneys[0].destination?.iata;
    if (!arrivalStationCode) {
      return this.sortCountries(data.countries);
    }

    const matchedStation = this.getMatchedStation(arrivalStationCode);
    if (!matchedStation) {
      return this.sortCountries(data.countries);
    }

    this.updateCountriesOrder(data, matchedStation.countryCode);
    return this.sortCountries(data.countries);
  }

  private getMatchedStation(arrivalStationCode: string): Station | undefined {
    const culture = urlHelpers.getCultureFromCurrentUrl();
    const sessionStorageKey = culture ? `data_${culture.toLowerCase()}` : 'data_';
    const sessionData = this.storageService.getSessionStorage(sessionStorageKey);
    const stations: Station[] = sessionData?.stations || [];
    return stations.find((station) => station.code === arrivalStationCode);
  }

  private updateCountriesOrder(data: ManageCountriesStrategyOrder, countryCodeByArrivalStation: string): void {
    for (const country of data.countries) {
      if (country.code === countryCodeByArrivalStation) {
        this.setPreferredCountryOrder(country, data.maxOrderValue);
      } else if (this.shouldIncrementOrder(country, data.maxOrderValue)) {
        country.order = (country.order ?? 0) + 1;
      }
    }
    data.maxOrderValue++;
  }

  private setPreferredCountryOrder(country: Country, maxOrderValue: number): void {
    if (!country.order || country.order > maxOrderValue) {
      country.order = maxOrderValue;
    }
  }

  private shouldIncrementOrder(country: Country, maxOrderValue: number): boolean {
    return country.order != null && !Number.isNaN(+country.order) && +country.order >= maxOrderValue;
  }

  private sortCountries(countries: Country[]): Country[] {
    return countries.sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''));
  }
}
