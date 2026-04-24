import { PageLayoutAlignment, PageLayoutBreakpointSize, PageLayoutOrderValue } from '../enums/page-layout.enums';

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
  alignment?: PageLayoutAlignment;
  backgroundColor?: string;
  customClass?: string;
}

export interface PageLayoutColBreakpoint {
  size: PageLayoutBreakpointSize;
  columns: number;
}

export interface PageLayoutColOrder {
  size: PageLayoutBreakpointSize;
  value: PageLayoutOrderValue;
}

export interface PageLayoutColConfig {
  columns?: number; // 1..12 (default 12)
  breakpoints?: PageLayoutColBreakpoint[];
  order?: PageLayoutColOrder[];
}

export interface PageLayoutCol {
  component: { id?: string; config?: Record<string, unknown>; [key: string]: unknown };
  config?: PageLayoutColConfig;
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
