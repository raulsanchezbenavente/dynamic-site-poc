export interface TabLayoutCol {
  component?: { id?: string; config?: Record<string, unknown>; [key: string]: unknown };
  span?: number;
}

export interface TabLayoutRowConfig {
  fluid?: boolean;
  column?: boolean;
  noPaddingBottom?: boolean;
  marginTop?: boolean;
  marginBottom?: boolean;
  paddingTop?: boolean;
  paddingBottom?: boolean;
  noGutter?: boolean;
  reverse?: boolean;
  alignment?: 'start' | 'center' | 'end';
  backgroundColor?: string;
  customClass?: string;
}

export interface TabLayoutRow {
  cols?: TabLayoutCol[];
  config?: TabLayoutRowConfig;
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
