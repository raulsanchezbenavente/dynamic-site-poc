export interface SiteBlockConfig {
  [key: string]: unknown;
}

export interface SiteTabSummary {
  name: string;
  title?: string;
  secondaryText?: string;
  tabId?: string;
}

export interface SiteSeoConfig {
  title?: string;
  description?: string;
  robots?: string;
  canonical?: string;
}

export interface SiteTab {
  tabId?: string;
  pageId?: string;
  name?: string;
  title?: string;
  secondaryText?: string;
  layout?: SiteLayout | SiteLayoutRow[];
  // [key: string]: unknown;
}

export interface SiteLayoutCol {
  component?: string;
  span?: number;
  config?: SiteBlockConfig & {
    tabsId?: string | number;
    tabs?: SiteTab[];
  };
  // [key: string]: unknown;
}

export interface SiteLayoutRow {
  cols?: SiteLayoutCol[];
  // [key: string]: unknown;
}

export interface SiteLayout {
  rows?: SiteLayoutRow[];
  // [key: string]: unknown;
}

export interface SitePage {
  pageId?: string;
  path?: string;
  name?: string;
  layout?: SiteLayout | SiteLayoutRow[];
  seo?: SiteSeoConfig;
  // [key: string]: unknown;
}

export interface SiteConfigResponse {
  pages: SitePage[];
}
