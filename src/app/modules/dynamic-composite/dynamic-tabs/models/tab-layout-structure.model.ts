export interface TabLayoutCol {
  component?: string;
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
