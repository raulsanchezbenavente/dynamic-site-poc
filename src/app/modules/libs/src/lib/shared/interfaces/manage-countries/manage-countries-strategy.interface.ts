import { ManageCountriesTypeEnum } from '../../enums/manage-countries/manage-countries-type.enum';
import { Country } from '../../model';
import { ManageCountriesStrategyOrder } from '../../model/manageCountriesStrategyOrder';

export interface IManageCountriesStrategy {
  name: ManageCountriesTypeEnum;
  process(data: ManageCountriesStrategyOrder): Country[];
}
