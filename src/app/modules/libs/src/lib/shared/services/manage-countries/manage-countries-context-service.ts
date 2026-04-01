import { Inject, Injectable, Optional } from '@angular/core';

import { ManageCountriesTypeEnum } from '../../enums/manage-countries/manage-countries-type.enum';
import { clone } from '../../helpers/utilities-helper';
import { BUSINESS_CONFIG, MANAGE_COUNTRIES_STRATEGY } from '../../injection-tokens';
import { IManageCountriesStrategy } from '../../interfaces';
import { BusinessConfig, Country, ManageCountriesStrategyOrder } from '../../model';

@Injectable({ providedIn: 'root' })
export class ManageCountriesContextService {
  private readonly strategies: IManageCountriesStrategy[] = [];
  private readonly defaultStrategy: ManageCountriesTypeEnum =
    ManageCountriesTypeEnum.PREFERRED_COUNTRIES_BY_CONFIG_STRATEGY;

  constructor(
    @Optional() @Inject(BUSINESS_CONFIG) protected businessConfig: BusinessConfig,
    @Optional()
    @Inject(MANAGE_COUNTRIES_STRATEGY)
    protected manageCountriesStrategies: readonly IManageCountriesStrategy[]
  ) {
    this.setStrategies();
  }

  public processedCountries(countries: Country[]): Country[] {
    const data: ManageCountriesStrategyOrder = {
      countries: clone(countries),
      maxOrderValue: 0,
    };
    for (const strategy of this.strategies) {
      strategy.process(data);
    }
    return data.countries;
  }

  private setStrategies(): void {
    if (
      this.businessConfig.manageCountries?.preferredCountriesStrategy &&
      this.businessConfig.manageCountries.preferredCountriesStrategy.length > 0
    ) {
      for (const element of this.businessConfig.manageCountries.preferredCountriesStrategy) {
        for (const manageCountriesStrategy of this.manageCountriesStrategies) {
          if (element === manageCountriesStrategy.name) {
            this.strategies.push(manageCountriesStrategy);
          }
        }
      }

      if (!this.strategies || this.strategies.length === 0) {
        throw new Error('No suitable preferred countries strategy found');
      }
    } else {
      this.strategies.push(
        this.manageCountriesStrategies.find(
          (manageCountriesStrategy) => manageCountriesStrategy.name === this.defaultStrategy
        )!
      );
    }
  }
}
