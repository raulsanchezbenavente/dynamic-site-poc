import { DropdownConfig, DropdownLayoutType, DropdownListConfig } from '@dcx/ui/libs';

export const MOCK_DROPDOWN_CITIES: DropdownListConfig = {
  dropdownModel: {
    config: {
      label: 'Select city',
      layoutConfig: {
        layout: DropdownLayoutType.DEFAULT,
      },
      ariaAttributes: {
        ariaControls: 'cityDropdownId',
      },
      accessibilityConfig: {
        id: 'cityButtonDropdownId',
      },
      closeOnSelection: true,
    } as DropdownConfig,
    value: '',
    isVisible: false,
  },
  optionsListConfig: {
    options: [],
    accessibilityConfig: {
      id: 'cityDropdownId',
    },
  },
};

export const MOCK_DROPDOWN_COUNTRIES: DropdownListConfig = {
  dropdownModel: {
    config: {
      label: 'Select country',
      layoutConfig: {
        layout: DropdownLayoutType.DEFAULT,
      },
      accessibilityConfig: {
        id: 'countriesButtonDropdownId',
      },
      ariaAttributes: {
        ariaControls: 'countriesDropdownId',
      },
      closeOnSelection: true,
    },
    value: 'Austria',
    isVisible: false,
  },
  optionsListConfig: {
    options: [],
    accessibilityConfig: {
      id: 'countriesDropdownId',
    },
  },
} as DropdownListConfig;
