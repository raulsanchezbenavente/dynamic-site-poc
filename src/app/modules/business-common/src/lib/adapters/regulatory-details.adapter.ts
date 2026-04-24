import { RegulatoryDetailsModels } from '@dcx/module/api-clients';

import {
  PaxRegulatoryDetailsVM,
  RegulatoryPaxDetailsCategory,
  RegulatoryPaxMissingDetailItem,
  RegulatoryPaxMissingDetails,
} from '../models';

export class RegulatoryDetailsAdapter {
  public static adaptPaxRegulatoryDetailsResponse(
    regulatoryDetailsDto: RegulatoryDetailsModels.PaxRegulatoryDetailsResponseObject
  ): PaxRegulatoryDetailsVM | null {
    if (!regulatoryDetailsDto) {
      console.warn('RegulatoryDetailsAdapter', 'Received null/undefined regulatory details DTO');
      return null;
    }
    return this.mapDtoToViewModel(regulatoryDetailsDto);
  }

  private static mapDtoToViewModel(
    regulatoryDetailsDto: RegulatoryDetailsModels.PaxRegulatoryDetailsResponseObject
  ): PaxRegulatoryDetailsVM {
    const missingDetails: RegulatoryPaxMissingDetails[] = [];

    if (regulatoryDetailsDto?.data?.missingDetails) {
      for (const detail of regulatoryDetailsDto.data.missingDetails) {
        missingDetails.push({
          category: this.isValidCategory(detail?.category) ? detail.category : RegulatoryPaxDetailsCategory.DEFAULT,
          missingDetails: this.mapMissingDetails(detail?.missingDetails),
          isCompleted: detail?.isCompleted ?? false,
        });
      }
    }

    return {
      paxId: regulatoryDetailsDto.data?.paxId ?? '',
      statusCleared: regulatoryDetailsDto.data?.statusCleared ?? false,
      missingDetails,
    };
  }

  private static readonly VALID_CATEGORIES = Object.freeze(Object.values(RegulatoryPaxDetailsCategory));

  private static isValidCategory(category: string | undefined): category is RegulatoryPaxDetailsCategory {
    return (
      category !== undefined &&
      RegulatoryDetailsAdapter.VALID_CATEGORIES.includes(category as RegulatoryPaxDetailsCategory)
    );
  }

  private static mapMissingDetails(
    details: RegulatoryDetailsModels.RegulatoryPaxMissingDetailItem[] | undefined
  ): RegulatoryPaxMissingDetailItem[] {
    const mappedDetails: RegulatoryPaxMissingDetailItem[] =
      details?.map((detail) => ({
        canBeDeclined: detail?.canBeDeclined ?? false,
        detailsType: detail?.detailsType ?? '',
        regulatoryType: detail?.regulatoryType ?? '',
        requiredDetailsFields: detail?.requiredDetailsFields ?? ([] as string[]),
        isOptional: detail?.isOptional ?? false,
      })) ?? [];

    return mappedDetails;
  }
}
