export interface SiteBlockConfig {
  // Open CMS contract: each block component defines and validates its own
  // config interface at the component boundary.
  [key: string]: unknown;
}

export interface SiteSeoConfig {
  title?: string;
  description?: string;
  robots?: string;
  canonical?: string;
}

export interface SiteLayoutCol {
  component?: string;
  span?: number;
  baseConfig?: SiteBlockConfig;
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
