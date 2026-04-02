import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Country, CultureServiceEx, ManageCountriesService, ResourcesRetrieveService } from '@dcx/ui/libs';
import { RfListOption } from 'reactive-forms';
import { catchError, map, Observable, of } from 'rxjs';

import { PREFIX_ISO2 } from './enums/prefix-countries.enum';
import { AMBIGUOUS_PREFIX_COUNTRIES } from './guess-prefix.service';
import { ApiCountry, CountriesResponse, UnifiedCountry } from './models/country-lf.models';

@Injectable({ providedIn: 'root' })
export class CountryMapperService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/configuration/api/v1/Countries';
  private countries: ApiCountry[] = [];
  private readonly resourcesRetrieveService = inject(ResourcesRetrieveService);
  private readonly manageCountryService = inject(ManageCountriesService);
  private readonly cultureServiceEx = inject(CultureServiceEx);

  public getCountriesListOptions(
    culture: string,
    preferredCodes: string[] = []
  ): Observable<{ countriesOptions: RfListOption[]; countryPrefixOptions: RfListOption[] }> {
    return this.resourcesRetrieveService.GetCountries(culture).pipe(
      catchError((error) => {
        console.error('Error fetching countries:', error);
        return of([]);
      }),
      map((countries: Country[]) => {
        const processedCountries = this.manageCountryService.getProcessedCountries(countries, culture);
        let resultList: Country[] = [];
        const originCode = preferredCodes[0];
        const destinationCode = preferredCodes[1];

        const originCountry = processedCountries.find((c) => c.code === originCode) ?? null;
        const destinationCountry = processedCountries.find((c) => c.code === destinationCode) ?? null;

        const sortedCountries = [...processedCountries]
          .filter((country) => !preferredCodes.includes(country.code ?? ''))
          .sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''));

        resultList =
          originCountry === destinationCountry
            ? [originCountry, ...sortedCountries].filter((c): c is Country => c != null)
            : [originCountry, destinationCountry, ...sortedCountries].filter((c): c is Country => c != null);

        const countriesOptions = resultList.map((country) => ({
          value: country.code ?? 'Unknown',
          content: country.name ?? '',
          preferred: preferredCodes.includes(country.code ?? ''),
        }));

        const sortedCountriesOptions = this.sortOptionsWithPreferredFirst(countriesOptions);

        const countryPrefixOptions = resultList.map((country) => {
          let prefix = country.phonePrefix ?? 'Unknown';
          if (AMBIGUOUS_PREFIX_COUNTRIES.includes(prefix) && country.code) {
            prefix = `${prefix}-${country.code}`;
          }

          return {
            value: prefix,
            content: country.name ? `${country.name} (${country.phonePrefix})` : '',
            code: country.code,
            preferred: preferredCodes.includes(country.code ?? ''),
          };
        });

        const sortedPrefixOptions = this.sortOptionsWithPreferredFirst(countryPrefixOptions);

        return { countriesOptions: sortedCountriesOptions, countryPrefixOptions: sortedPrefixOptions };
      })
    );
  }

  public getCountiesUsingResourceClient(
    culture: string,
    preferredCountryCode: string
  ): Observable<{ countriesOptions: RfListOption[]; countryPrefixOptions: RfListOption[] }> {
    // return this.resourceClient.countries('1', undefined, undefined, culture).pipe(
    return this.loadUnifiedCountries().pipe(
      catchError((error) => {
        console.error('Error fetching countries using ResourceClient:', error);
        return of({ data: [] });
      }),
      map((response: any) => {
        // RESTORE AFTER THE ENDPOINT WILL FIX
        // const { result } = response;
        // const { data } = result || {};
        // const countries: Country[] = data ?? [];
        const countries: Country[] = response;
        const processedCountries = this.manageCountryService.getProcessedCountries(countries, culture);

        const sortedCountries = [...processedCountries].sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''));
        const countriesOptions = sortedCountries.map((country) => ({
          value: country.code ?? 'Unknown',
          content: country.name ?? '',
          preferred: country.code === preferredCountryCode,
        }));

        const sortedCountriesForPrefix = [...processedCountries].sort((a, b) =>
          (a.name ?? '').localeCompare(b.name ?? '')
        );

        const countryPrefixOptions = sortedCountriesForPrefix.map((country) => {
          let prefix = country.phonePrefix ?? 'Unknown';
          if (AMBIGUOUS_PREFIX_COUNTRIES.includes(prefix) && country.code) {
            prefix = `${prefix}-${country.code}`;
          }

          return {
            value: prefix,
            content: country.name ? `${country.name} (${country.phonePrefix})` : '',
            preferred: country.code === preferredCountryCode,
          };
        });

        return { countriesOptions, countryPrefixOptions };
      })
    );
  }

  public loadUnifiedCountries(): Observable<UnifiedCountry[]> {
    if (this.countries.length > 0) {
      return of(this.toUnified(this.countries));
    }

    const languageAndRegionCulture = this.cultureServiceEx.getLanguageAndRegion();
    return this.http.get<CountriesResponse>(`${this.baseUrl}?culture=${languageAndRegionCulture}`).pipe(
      map((response) => {
        this.countries = response.countries ?? [];
        return this.toUnified(this.countries);
      }),
      catchError(() => of([]))
    );
  }

  public isCountryInLifemilesList(countryCode: string): boolean {
    const code = countryCode.toUpperCase().trim();
    return this.countries.some((c) => c.codeIso2.toUpperCase().trim() === code);
  }

  private getPrefixByISO2(iso2code: string): string {
    const country = PREFIX_ISO2.find((c) => c.iso2 === iso2code.toUpperCase());
    return country ? country.phoneCode : '00';
  }

  private toUnified(countries: ApiCountry[]): UnifiedCountry[] {
    const byCode = new Map<string, UnifiedCountry>();

    const up = (s?: string): string => (s ?? '').toUpperCase().trim();

    for (const country of countries) {
      const code = up(country.codeIso2);
      if (!code) continue;
      const name = country.countryName.trim();
      byCode.set(code, {
        name,
        code,
        currencyCode: '',
        phonePrefix: this.getPrefixByISO2(code),
        order: '',
        languages: { 'en-US': name, 'es-ES': name, 'fr-FR': name, 'pt-BR': name },
      });
    }

    return [...byCode.values()].sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * Sorts options with preferred items at the top, followed by all items (including preferred) in alphabetical order
   * @param options List of options with preferred flag and content
   * @returns Sorted list with preferred items first, then alphabetical
   */
  private sortOptionsWithPreferredFirst<T extends { preferred: boolean; content: string }>(options: T[]): T[] {
    const preferredItems = options.filter((option) => option.preferred);
    const preferredDuplicates = preferredItems.map((item) => ({ ...item, preferred: false }));
    const nonPreferredItems = options.filter((option) => !option.preferred);

    const alphabeticalList = [...nonPreferredItems, ...preferredDuplicates].sort((a, b) =>
      (String(a.content) || '').localeCompare(String(b.content) || '')
    );

    return [...preferredItems, ...alphabeticalList];
  }
}
