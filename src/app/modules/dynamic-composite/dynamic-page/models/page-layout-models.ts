export interface PageLayoutCol {
  component: { id?: string; config?: Record<string, unknown>; [key: string]: unknown };
  span?: number; // 1..12 (default 12)
}

export interface PageLayoutRow {
  cols: PageLayoutCol[];
}

export interface PageLayout {
  rows: PageLayoutRow[];
}

export interface PageConfig {
  path: string;
  name: string;
  layout: PageLayout;
}
