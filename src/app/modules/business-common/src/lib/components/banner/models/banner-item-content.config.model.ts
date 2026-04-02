import { TitleHeading } from '@dcx/ui/design-system';
import { DictionaryType } from '@dcx/ui/libs';

import { BannerType } from '../enums';

export interface BannerItemContentConfig {
  bannerType?: BannerType;
  footnote?: string;
  lowestPrice?: DictionaryType<number>;
  subtitle?: string;
  title?: string;
  text?: string;
  headingLevel?: TitleHeading;
}
