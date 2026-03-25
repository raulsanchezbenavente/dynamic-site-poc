import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { SeoService } from '@navigation';

import { BlockOutletComponent } from './block-outlet.component';

type PageLayoutCol = {
  component: string;
  span?: number;
  tabs?: any[];
  config?: any;
  [key: string]: any;
};
type PageLayoutRow = { cols: PageLayoutCol[] };
type SeoConfig = {
  title?: string;
  description?: string;
  robots?: string;
  canonical?: string;
};
type DynamicPageRouteData = {
  components?: PageLayoutRow[];
  path?: string;
  pageName?: string;
  pageId?: string;
  seo?: SeoConfig;
};

@Component({
  selector: 'dynamic-page',
  standalone: true,
  imports: [CommonModule, BlockOutletComponent],
  templateUrl: './dynamic-page.component.html',
})
export class DynamicPageComponent implements OnInit {
  public rows: PageLayoutRow[] = [];
  private readonly rteBaseMaxWidthPx = 1200;

  private route = inject(ActivatedRoute);
  private titleService = inject(Title);
  private seoSvc = inject(SeoService);

  public ngOnInit(): void {
    this.route.data.subscribe((data) => {
      const routeData = data as DynamicPageRouteData;
      this.rows = Array.isArray(routeData.components) ? routeData.components : [];
      this.titleService.setTitle(String(routeData.pageName ?? ''));
      this.seoSvc.applyPageSeo(routeData.path, routeData.pageName, routeData.seo, routeData.pageId);
    });
  }

  public getInputs(col: PageLayoutCol): Record<string, any> {
    const { component, span, ...inputs } = col;
    return inputs;
  }

  public getRteColMaxWidth(col: PageLayoutCol): string | null {
    if (!this.isRteCol(col)) {
      return null;
    }

    const span = this.normalizeSpan(col.span);
    const proportionalMaxWidth = (this.rteBaseMaxWidthPx * span) / 12;
    return `${proportionalMaxWidth}px`;
  }

  public getRteColWidth(col: PageLayoutCol): string | null {
    return this.isRteCol(col) ? '100%' : null;
  }

  public getRteColJustifySelf(row: PageLayoutRow, colIndex: number, col: PageLayoutCol): string | null {
    if (!this.isRteCol(col)) {
      return null;
    }

    const position = this.getRtePosition(row, colIndex);
    if (position === 'left') {
      return 'end';
    }

    if (position === 'right') {
      return 'start';
    }

    return 'center';
  }

  public getRteColTextAlign(row: PageLayoutRow, colIndex: number, col: PageLayoutCol): string | null {
    if (!this.isRteCol(col)) {
      return null;
    }

    const position = this.getRtePosition(row, colIndex);
    if (position === 'left') {
      return 'right';
    }

    if (position === 'right') {
      return 'left';
    }

    return null;
  }

  private isRteCol(col: PageLayoutCol): boolean {
    return col.component === 'RTEinjector_uiplus';
  }

  private normalizeSpan(span?: number): number {
    const raw = Number(span ?? 12);
    if (!Number.isFinite(raw)) {
      return 12;
    }

    return Math.min(Math.max(Math.round(raw), 1), 12);
  }

  private getRtePosition(row: PageLayoutRow, colIndex: number): 'left' | 'right' | 'single' {
    const cols = Array.isArray(row?.cols) ? row.cols : [];
    const rteIndexes = cols
      .map((item, index) => ({ item, index }))
      .filter(({ item }) => this.isRteCol(item))
      .map(({ index }) => index);

    if (rteIndexes.length <= 1) {
      return 'single';
    }

    const rteOrderIndex = rteIndexes.indexOf(colIndex);
    if (rteOrderIndex < 0) {
      return 'single';
    }

    return rteOrderIndex < rteIndexes.length / 2 ? 'left' : 'right';
  }
}
