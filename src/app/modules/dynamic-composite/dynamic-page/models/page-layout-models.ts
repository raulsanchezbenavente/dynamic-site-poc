export interface PageLayoutRowConfig {
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

export interface PageLayoutCol {
  component: { id?: string; config?: Record<string, unknown>; [key: string]: unknown };
  span?: number; // 1..12 (default 12)
}

export interface PageLayoutRow {
  cols: PageLayoutCol[];
  config?: PageLayoutRowConfig;
}

export interface PageLayout {
  rows: PageLayoutRow[];
}

export interface PageConfig {
  path: string;
  name: string;
  layout: PageLayout;
}
