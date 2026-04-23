export interface CategoryConfig {
  data: { titleKey: string; popoverTitleKey: string };
  models: string[];
  label: string;
}

export const CUSTOM_SEAT_CATEGORY_CONTENT: Record<string, { titleKey: string; popoverTitleKey: string }> = {
  flatbed: {
    titleKey: 'SeatMap.SeatSelect_businessClassFlatbed.Subtitle',
    popoverTitleKey: 'SeatMap.SeatSelect_businessClassFlatbed.Subtitle',
  },
  businessClass: {
    titleKey: 'SeatMap.SeatSelect_businessClass.Subtitle',
    popoverTitleKey: 'SeatMap.SeatSelect_businessClass.Subtitle',
  },
  premium: {
    titleKey: 'SeatMap.SeatSelect_Premium.Subtitle',
    popoverTitleKey: 'SeatMap.SeatSelect_Premium.Subtitle',
  },
};

const MODELS_PREMIUM: string[] = ['A319', 'A320', 'A320N'];

const MODELS_FLATBED_BUSINESS: string[] = ['788', '787'];

const CONFIG_GROUPS = {
  flatbed: {
    data: CUSTOM_SEAT_CATEGORY_CONTENT['flatbed'],
    models: MODELS_FLATBED_BUSINESS,
    label: 'businessClassFlatbet',
  },
  business: {
    data: CUSTOM_SEAT_CATEGORY_CONTENT['businessClass'],
    models: MODELS_FLATBED_BUSINESS,
    label: 'businessClass',
  },
  premium: {
    data: CUSTOM_SEAT_CATEGORY_CONTENT['premium'],
    models: MODELS_PREMIUM,
    label: 'PREMIUM',
  },
};

export const SEAT_CATEGORY_CONTENT_BY_ACV: Record<string, CategoryConfig> = {
  '88A': CONFIG_GROUPS.flatbed,
  '78A': CONFIG_GROUPS.flatbed,
  '78N': CONFIG_GROUPS.business,
  ...Object.fromEntries(
    [
      '312',
      '19K',
      '20F',
      '20P',
      '22K',
      '2EX',
      '2LP',
      '2LR',
      '2NF',
      '2NK',
      '2NL',
      '2NP',
      '2NT',
      '2TA',
      '2TP',
      '31J',
      '32G',
      'EX1',
    ].map((acv) => [acv, CONFIG_GROUPS.premium])
  ),
};
