/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
import { Injectable } from '@angular/core';
import { Country, DictionaryType } from '@dcx/ui/libs';
import { RfListOption } from 'reactive-forms';
import { Observable, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CountryMapperServiceFake {
  public getCountriesListOptions(
    culture: string,
    translations: DictionaryType
  ): Observable<{ countriesOptions: RfListOption[]; countryPrefixOptions: RfListOption[] }> {
    const mockCountries: Country[] = [
      { code: 'US', name: 'United States', phonePrefix: '1', order: 1, image: { src: 'us.png' } },
      { code: 'CA', name: 'Canada', phonePrefix: '11', order: 2, image: { src: 'ca.png' } },
    ];

    const sortedCountries = [...mockCountries].sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''));

    const countriesOptions: RfListOption[] = sortedCountries.map((country) => ({
      value: country.code ?? 'Unknown',
      content: country.name ?? '',
    }));

    const countryPrefixOptions: RfListOption[] = sortedCountries.map((country) => ({
      value: country.phonePrefix ?? 'Unknown',
      content: country.name ? `${country.name} (${country.phonePrefix})` : '',
    }));

    return of({ countriesOptions, countryPrefixOptions });
  }
}
