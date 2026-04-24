import { RegulatoryDetailsModels } from '@dcx/module/api-clients';

import { RegulatoryPaxDetailsCategory } from '../models';
import { RegulatoryDetailsAdapter } from './regulatory-details.adapter';

describe('RegulatoryDetailsAdapter', () => {
  const buildResponseObject = (
    data: Partial<{
      paxId: string;
      statusCleared: boolean;
      missingDetails: Array<{
        category?: string;
        isCompleted?: boolean;
        missingDetails?: Array<{
          canBeDeclined?: boolean;
          detailsType?: string;
          regulatoryType?: string;
          requiredDetailsFields?: string[];
          isOptional?: boolean;
        }>;
      }>;
    }> = {}
  ): RegulatoryDetailsModels.PaxRegulatoryDetailsResponseObject => {
    return {
      data: {
        paxId: data.paxId ?? 'PAX-1',
        statusCleared: data.statusCleared ?? false,
        missingDetails: data.missingDetails ?? [],
      },
    } as unknown as RegulatoryDetailsModels.PaxRegulatoryDetailsResponseObject;
  };

  it('should return null when response is null', () => {
    const result = RegulatoryDetailsAdapter.adaptPaxRegulatoryDetailsResponse(null as unknown as RegulatoryDetailsModels.PaxRegulatoryDetailsResponseObject);

    expect(result).toBeNull();
  });

  it('should map top-level fields and missing details', () => {
    const dto = buildResponseObject({
      paxId: 'PAX-2',
      statusCleared: true,
      missingDetails: [
        {
          category: 'identityDocument',
          isCompleted: false,
          missingDetails: [
            {
              canBeDeclined: true,
              detailsType: 'document',
              regulatoryType: 'travel',
              requiredDetailsFields: ['number', 'expiryDate'],
              isOptional: false,
            },
          ],
        },
      ],
    });

    const result = RegulatoryDetailsAdapter.adaptPaxRegulatoryDetailsResponse(dto);

    expect(result).not.toBeNull();
    expect(result?.paxId).toBe('PAX-2');
    expect(result?.statusCleared).toBeTrue();
    expect(result?.missingDetails.length).toBe(1);
    expect(result?.missingDetails[0].category).toBe(RegulatoryPaxDetailsCategory.IDENTITY_DOCUMENT);
    expect(result?.missingDetails[0].isCompleted).toBeFalse();
    expect(result?.missingDetails[0].missingDetails[0].requiredDetailsFields).toEqual(['number', 'expiryDate']);
  });

  it('should use DEFAULT category when backend category is undefined or invalid', () => {
    const dto = buildResponseObject({
      missingDetails: [
        {
          category: undefined,
          isCompleted: true,
          missingDetails: [],
        },
        {
          category: 'invalidCategory',
          isCompleted: false,
          missingDetails: [],
        },
      ],
    });

    const result = RegulatoryDetailsAdapter.adaptPaxRegulatoryDetailsResponse(dto);

    expect(result).not.toBeNull();
    expect(result?.missingDetails.length).toBe(2);
    expect(result?.missingDetails[0].category).toBe(RegulatoryPaxDetailsCategory.DEFAULT);
    expect(result?.missingDetails[0].isCompleted).toBeTrue();
    expect(result?.missingDetails[1].category).toBe(RegulatoryPaxDetailsCategory.DEFAULT);
    expect(result?.missingDetails[1].isCompleted).toBeFalse();
  });

  it('should return empty missingDetails when API missingDetails is undefined', () => {
    const dto = {
      data: {
        paxId: 'PAX-9',
        statusCleared: false,
      },
    } as unknown as RegulatoryDetailsModels.PaxRegulatoryDetailsResponseObject;

    const result = RegulatoryDetailsAdapter.adaptPaxRegulatoryDetailsResponse(dto);

    expect(result).not.toBeNull();
    expect(result?.paxId).toBe('PAX-9');
    expect(result?.missingDetails).toEqual([]);
  });
});
