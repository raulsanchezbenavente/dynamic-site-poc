export type CmsTabLayoutCol = {
  component?: string;
  span?: number;
};

export type CmsTabLayoutRow = {
  cols?: CmsTabLayoutCol[];
};

export type CmsTabLayout = {
  rows?: CmsTabLayoutRow[];
};

export type CmsTabContract = {
  tabId?: string;
  name?: string;
  title?: string;
  secondaryText?: string;
  layout?: CmsTabLayout | CmsTabLayoutRow[];
  pageId?: string;
};

export type CmsTabsBlockConfig = {
  tabsId?: string;
  tabs?: CmsTabContract[];
};
