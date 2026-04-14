import { DictionaryType } from '@dcx/ui/libs';

import { BreadcrumbItem } from './breadcrumb-item.config';

export interface BreadcrumbConfig {
  home?: BreadcrumbItem;
  items: BreadcrumbItem[];
  translations: DictionaryType<string>;
}
