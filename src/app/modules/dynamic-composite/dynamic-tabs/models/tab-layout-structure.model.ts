export interface TabLayoutCol {
  component?: { id?: string; config?: Record<string, unknown>; [key: string]: unknown };
  config?: TabLayoutColConfig;
}

export interface TabLayoutColBreakpoint {
  size: '' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  columns: number;
}

export interface TabLayoutColOrder {
  size: '' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  value: '' | 'first' | 'last';
}

export interface TabLayoutColConfig {
  columns?: number; // 1..12 (default 12)
  breakpoints?: TabLayoutColBreakpoint[];
  order?: TabLayoutColOrder[];
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
