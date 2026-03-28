export interface SiteBlockConfig {
  // Open CMS contract: each block component defines and validates its own
  // config interface at the component boundary.
  // Example: tabs uses its own config model (tabsId/tabs inside config),
  // while other blocks (loyalty, main-header, rte, etc.) use their own.
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
}

export interface SiteLayoutCol {
  component?: string;
  span?: number;
  config?: SiteBlockConfig;
}

export interface SiteLayoutRow {
  cols?: SiteLayoutCol[];
}

export interface SiteLayout {
  rows?: SiteLayoutRow[];
}

export interface SitePage {
  pageId?: string;
  path?: string;
  name?: string;
  layout?: SiteLayout | SiteLayoutRow[];
  seo?: SiteSeoConfig;
}

export interface SiteConfigResponse {
  pages: SitePage[];
}
