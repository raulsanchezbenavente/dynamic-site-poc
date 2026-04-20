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
  slot?: string;
  span?: number;
  config?: SiteBlockConfig;
}

export interface SiteLayoutRow {
  cols?: SiteLayoutCol[];
  slot?: string;
}

export interface SiteLayout {
  rows?: SiteLayoutRow[];
}

export type SiteLayoutSource = SiteLayout | SiteLayoutRow[] | string;
export type SiteSlots = Record<string, SiteLayoutSource>;

export interface SitePage {
  pageId?: string;
  path?: string;
  name?: string;
  layout?: SiteLayoutSource;
  slots?: SiteSlots;
  seo?: SiteSeoConfig;
}

export interface SiteConfigResponse {
  pages: SitePage[];
}
