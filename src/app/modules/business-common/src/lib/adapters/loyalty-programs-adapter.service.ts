import { CmsConfigModels } from '@dcx/module/api-clients';

import { LoyaltyPrograms, LoyaltyProgramTier } from '../models';

export class LoyaltyProgramsAdapter {
  public static adaptLoyaltyPrograms(response: CmsConfigModels.LoyaltyPrograms | null | undefined): LoyaltyPrograms {
    return {
      items: response?.items?.map((item) => this.mapToDomain(item)) ?? [],
    };
  }

  private static mapToDomain(apiProgram: CmsConfigModels.LoyaltyProgram): LoyaltyProgramTier {
    return {
      tierCode: apiProgram.tierCode || '',
      tierName: apiProgram.tierName || '',
      mainColor: apiProgram.mainColor || '',
      darkerColor: apiProgram.darkerColor || '',
    };
  }
}
