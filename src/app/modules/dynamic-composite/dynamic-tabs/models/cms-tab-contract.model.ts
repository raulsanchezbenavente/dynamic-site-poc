export interface CmsTabLayoutCol {
  component?: string;
  span?: number;
}

export interface CmsTabLayoutRow {
  cols?: CmsTabLayoutCol[];
}

export interface CmsTabLayout {
  rows?: CmsTabLayoutRow[];
}

export interface CmsTabContract {
  tabId?: string;
  name?: string;
  title?: string;
  secondaryText?: string;
  layout?: CmsTabLayout | CmsTabLayoutRow[];
  pageId?: string;
}

export interface CmsTabsBlockConfig {
  tabsId?: string;
  tabs?: CmsTabContract[];
}
