export type CmsTabLayoutCol = {
  component?: string;
  span?: number;
  [key: string]: unknown;
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
