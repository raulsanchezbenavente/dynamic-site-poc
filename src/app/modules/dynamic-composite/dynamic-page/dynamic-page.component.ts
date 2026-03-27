import { CommonModule, DOCUMENT } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
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

type ComponentReadyDetail = {
  batchId?: string;
  componentId?: string;
  component?: string;
  state?: string;
};

@Component({
  selector: 'dynamic-page',
  standalone: true,
  imports: [CommonModule, BlockOutletComponent],
  templateUrl: './dynamic-page.component.html',
})
export class DynamicPageComponent implements OnInit, OnDestroy {
  private static readonly LOCALIZED_COMPONENTS = new Set(['RTEinjector_uiplus']);

  public rows: PageLayoutRow[] = [];

  private document = inject(DOCUMENT);
  private route = inject(ActivatedRoute);
  private titleService = inject(Title);
  private seoSvc = inject(SeoService);
  private currentPageId: string | undefined;
  private currentBatchId = '';
  private currentBatchPageId = '';
  private expectedCompletions = 0;
  private completedCompletions = 0;
  private completedComponentIds = new Set<string>();
  private batchSequence = 0;

  public ngOnDestroy(): void {
    this.document.removeEventListener('dynamic-page:component-ready', this.onComponentReady);
  }

  public ngOnInit(): void {
    this.document.addEventListener('dynamic-page:component-ready', this.onComponentReady);

    this.route.data.subscribe((data) => {
      const routeData = data as DynamicPageRouteData;
      const pageId = String(routeData.pageId ?? '');
      const sourceRows = Array.isArray(routeData.components) ? routeData.components : [];
      const nextBatchId = this.createBatchId(pageId);
      const trackedRows = this.attachComponentTracking(sourceRows, nextBatchId);
      this.resetBatchTracking(nextBatchId, pageId, trackedRows);

      // When the router reuses this component across a language switch (same pageId,
      // different language prefix), route.data still emits with structurally identical
      // components. Avoid reassigning `rows` in that case to prevent `@for` from
      // destroying and recreating every block outlet (visible rerender).
      if (this.currentPageId !== routeData.pageId) {
        this.currentPageId = routeData.pageId;
        this.rows = trackedRows;
      } else {
        this.refreshLocalizedBlocks(trackedRows);
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

  private onComponentReady = (event: Event): void => {
    const detail = (event as CustomEvent<ComponentReadyDetail>).detail;
    if (!detail || detail.batchId !== this.currentBatchId) {
      return;
    }

    const componentId = String(detail.componentId ?? '').trim();
    if (componentId.length === 0 || this.completedComponentIds.has(componentId)) {
      return;
    }

    this.completedComponentIds.add(componentId);
    this.completedCompletions += 1;
    if (this.completedCompletions < this.expectedCompletions) {
      return;
    }

    this.logAndFinalizePageReady();
  };

  private logAndFinalizePageReady(): void {
    console.log('[dynamic-page] all mapped components ready', {
      pageId: this.currentBatchPageId,
      batchId: this.currentBatchId,
      expected: this.expectedCompletions,
      completed: this.completedCompletions,
    });

    this.removeBootLoader();
  }

  private createBatchId(pageId: string): string {
    this.batchSequence += 1;
    return `${pageId || 'no-page'}::${this.batchSequence}`;
  }

  private resetBatchTracking(batchId: string, pageId: string, rows: PageLayoutRow[]): void {
    this.currentBatchId = batchId;
    this.currentBatchPageId = pageId;
    this.expectedCompletions = this.countMappableComponents(rows);
    this.completedCompletions = 0;
    this.completedComponentIds.clear();
  }

  private attachComponentTracking(rows: PageLayoutRow[], batchId: string): PageLayoutRow[] {
    return rows.map((row, rowIndex) => {
      const cols = (row?.cols ?? []).map((col, colIndex) => {
        const componentName = String(col?.component ?? '').trim();
        if (!componentName) {
          return col;
        }

        return {
          ...col,
          __dynamicPageBatchId: batchId,
          __dynamicPageComponentId: `${rowIndex}:${colIndex}`,
          __dynamicPageComponentName: componentName,
        };
      });

      return { ...row, cols };
    });
  }

  private countMappableComponents(rows: PageLayoutRow[]): number {
    let total = 0;

    for (const row of rows) {
      for (const col of row?.cols ?? []) {
        if (String(col?.component ?? '').trim()) {
          total += 1;
        }
      }
    }

    return total;
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
  private removeBootLoader(): void {
    this.document.getElementById('boot-loader')?.remove();
  }
}
