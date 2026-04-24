import { Injectable } from '@angular/core';
import { AvailableOption, GroupOptionElementData } from '@dcx/ui/design-system';

@Injectable({ providedIn: 'root' })
export class GroupOptionsMapper {
  /**
   * Enriches configured options with availability state from backend.
   * Filters out unavailable options and marks disabled ones.
   *
   * Uses a Map for O(1) lookup performance instead of repeated array searches.
   *
   * @param configuredOptions - Options from CMS/config
   * @param availableOptions - Current availability state from API
   * @returns Filtered and enriched option items ready for display
   */
  public enrichOptionsWithAvailability(
    configuredOptions: GroupOptionElementData[],
    availableOptions: AvailableOption[]
  ): GroupOptionElementData[] {
    if (!configuredOptions?.length || !availableOptions?.length) {
      return [];
    }

    const availableOptionsMap = new Map(availableOptions.map((ao) => [ao.code, ao]));

    return configuredOptions.reduce<GroupOptionElementData[]>((acc, option) => {
      if (!option.code) {
        return acc;
      }

      const availableOption = availableOptionsMap.get(option.code);
      if (availableOption) {
        acc.push({
          ...option,
          isDisabled: availableOption.isDisabled,
        });
      }

      return acc;
    }, []);
  }
}
