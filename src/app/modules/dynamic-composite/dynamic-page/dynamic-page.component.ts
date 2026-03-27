import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { SeoService } from '@navigation';

import { BlockOutletComponent } from '../block-outlet/block-outlet.component';

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
  private static readonly LOCALIZED_COMPONENTS = new Set(['RTEinjector_uiplus']);

  public rows: PageLayoutRow[] = [];

  private route = inject(ActivatedRoute);
  private titleService = inject(Title);
  private seoSvc = inject(SeoService);
  private currentPageId: string | undefined;

  public ngOnInit(): void {
    this.route.data.subscribe((data) => {
      const routeData = data as DynamicPageRouteData;

      // When the router reuses this component across a language switch (same pageId,
      // different language prefix), route.data still emits with structurally identical
      // components. Avoid reassigning `rows` in that case to prevent `@for` from
      // destroying and recreating every block outlet (visible rerender).
      if (this.currentPageId !== routeData.pageId) {
        this.currentPageId = routeData.pageId;
        this.rows = Array.isArray(routeData.components) ? routeData.components : [];
      } else {
        this.refreshLocalizedBlocks(routeData.components);
      }

      this.titleService.setTitle(String(routeData.pageName ?? ''));
      this.seoSvc.applyPageSeo(routeData.path, routeData.pageName, routeData.seo, routeData.pageId);
    });
  }

  public getInputs(col: PageLayoutCol): Record<string, any> {
    const { component, span, ...inputs } = col;
    return inputs;
  }

  public hasRteInjector(row: PageLayoutRow): boolean {
    return (row?.cols ?? []).some((col) => col?.component === 'RTEinjector_uiplus');
  }

  private refreshLocalizedBlocks(nextRowsCandidate: PageLayoutRow[] | undefined): void {
    const nextRows = Array.isArray(nextRowsCandidate) ? nextRowsCandidate : [];
    if (this.rows.length === 0 || nextRows.length === 0) {
      return;
    }

    let anyRowChanged = false;

    const updatedRows = this.rows.map((currentRow, rowIndex) => {
      const nextRow = nextRows[rowIndex];
      if (!nextRow || !Array.isArray(nextRow.cols) || !Array.isArray(currentRow.cols)) {
        return currentRow;
      }

      let rowChanged = false;

      const updatedCols = currentRow.cols.map((currentCol, colIndex) => {
        const nextCol = nextRow.cols[colIndex];
        if (!nextCol || nextCol.component !== currentCol.component) {
          return currentCol;
        }

        if (!DynamicPageComponent.LOCALIZED_COMPONENTS.has(String(nextCol.component ?? ''))) {
          return currentCol;
        }

        rowChanged = true;
        return nextCol;
      });

      if (!rowChanged) {
        return currentRow;
      }

      anyRowChanged = true;
      return { ...currentRow, cols: updatedCols };
    });

    if (anyRowChanged) {
      this.rows = updatedRows;
    }
  }
}
