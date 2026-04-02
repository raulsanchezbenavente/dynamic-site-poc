import { CmsConfigModels } from '@dcx/module/api-clients';
import { PointOfSale } from '@dcx/ui/libs';

export class PointOfSaleAdapter {
  public static adaptPointsOfSale(items: CmsConfigModels.PointOfSale[] | undefined): PointOfSale[] {
    if (!items || !Array.isArray(items)) {
      return [];
    }
    return items.map((item) => this.mapToDomain(item));
  }

  private static mapToDomain(apiPos: CmsConfigModels.PointOfSale): PointOfSale {
    return {
      name: apiPos.name || '',
      stationCode: apiPos.stationCode || '',
      code: apiPos.code || '',
      default: apiPos.default || false,
      flagImageCode: apiPos.flagImageCode || '',
      currency: {
        symbol: apiPos.currency?.symbol || '',
        code: apiPos.currency?.code || '',
        name: apiPos.currency?.name || '',
      },
      countryCode: apiPos.countryCode,
      otherCountryCodes: apiPos.otherCountryCodes || [],
      isForRestOfCountries: apiPos.isForRestOfCountries || false,
    };
  }
}
