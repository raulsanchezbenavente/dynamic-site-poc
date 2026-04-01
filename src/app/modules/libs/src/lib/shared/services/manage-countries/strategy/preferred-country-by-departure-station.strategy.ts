import { Injectable } from '@angular/core';

import { ManageCountriesTypeEnum } from '../../../enums';
import { urlHelpers } from '../../../helpers';
import { IManageCountriesStrategy } from '../../../interfaces';
import { Country, ManageCountriesStrategyOrder, Station } from '../../../model';
import { SessionStore } from '../../../session';
import { StorageService } from '../../storage.service';

@Injectable()
export class PreferredCountryByDepartureStationStrategy implements IManageCountriesStrategy {
  public name: ManageCountriesTypeEnum;

  constructor(
    protected storageService: StorageService,
    protected sessionStore: SessionStore
  ) {
    this.name = ManageCountriesTypeEnum.PREFERRED_COUNTRIES_BY_DEPARTURE_STATION_STRATEGY;
  }

  public process(data: ManageCountriesStrategyOrder): Country[] {
    const currentJourneys = this.sessionStore.getSession().session.booking.journeys;
    if (currentJourneys.length === 0) return data.countries;
    const departureStationCode = currentJourneys[0].origin.iata;
    const culture = urlHelpers.getCultureFromCurrentUrl();

    const sessionStorageKey = culture ? `data_${culture.toLowerCase()}` : 'data_';
    const sessionData = this.storageService.getSessionStorage(sessionStorageKey);
    const stations: Station[] = sessionData?.stations || [];
    const matchedStation = stations.find((station) => station.code === departureStationCode);
    if (!matchedStation) {
      return data.countries;
    }
    const countryCodeByDepartureStation = matchedStation.countryCode;

    for (const country of data.countries) {
      if (country.code === countryCodeByDepartureStation) {
        if (!country.order || country.order > data.maxOrderValue) {
          country.order = data.maxOrderValue;
        }
      } else if (country.order && !Number.isNaN(+country.order) && +country.order >= data.maxOrderValue) {
        country.order++;
      }
    }
    data.maxOrderValue++;

    return data.countries.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  }
}
