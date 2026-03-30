import { TabLayout, TabLayoutRow } from './tab-layout-structure.model';

export interface TabSummary {
  name: string;
  title?: string;
  secondaryText?: string;
  tabId?: string;
}

export interface TabConfigEntry {
  tabId?: string;
  pageId?: string;
  name?: string;
  title?: string;
  secondaryText?: string;
  layout?: TabLayout | TabLayoutRow[];
}
