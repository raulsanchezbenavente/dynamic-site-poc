import { Injectable } from '@angular/core';

import { ManageCountriesTypeEnum } from '../../../enums';
import { IManageCountriesStrategy } from '../../../interfaces';
import { Country, ManageCountriesStrategyOrder } from '../../../model';

@Injectable()
export class PreferredCountriesByConfigStrategy implements IManageCountriesStrategy {
  name: ManageCountriesTypeEnum;

  constructor() {
    this.name = ManageCountriesTypeEnum.PREFERRED_COUNTRIES_BY_CONFIG_STRATEGY;
  }

  process(data: ManageCountriesStrategyOrder): Country[] {
    data.maxOrderValue = Math.max(...data.countries.map((country) => +country.order!)) + 1;
    return data.countries.sort((a, b) => {
      const nameA = a.name || '';
      const nameB = b.name || '';
      return nameA.localeCompare(nameB);
    });
  }
}
