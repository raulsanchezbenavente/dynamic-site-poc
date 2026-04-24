export interface TabLayoutCol {
  component?: { id?: string; config?: Record<string, unknown>; [key: string]: unknown };
  span?: number;
}

export interface TabLayoutRow {
  cols?: TabLayoutCol[];
}

export interface TabLayout {
  rows?: TabLayoutRow[];
}

export interface TabStructure {
  tabId?: string;
  name?: string;
  title?: string;
  secondaryText?: string;
  layout?: TabLayout | TabLayoutRow[];
  pageId?: string;
}

export interface TabsLayoutConfig {
  tabsId?: string;
  tabs?: TabStructure[];
}
