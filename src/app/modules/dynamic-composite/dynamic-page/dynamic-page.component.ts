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

type RteRequestsFinishedDetail = {
  batchId?: string;
  componentId?: string;
  requested: number;
  succeeded: number;
  failed: number;
  durationMs: number;
  requestedUrls: string[];
};

@Component({
  selector: 'dynamic-page',
  standalone: true,
  imports: [CommonModule, BlockOutletComponent],
  templateUrl: './dynamic-page.component.html',
})
export class DynamicPageComponent implements OnInit, OnDestroy {
  private static readonly LOCALIZED_COMPONENTS = new Set(['RTEinjector_uiplus']);
  private static readonly RTE_COMPONENT = 'RTEinjector_uiplus';

  public rows: PageLayoutRow[] = [];

  private document = inject(DOCUMENT);
  private route = inject(ActivatedRoute);
  private titleService = inject(Title);
  private seoSvc = inject(SeoService);
  private currentPageId: string | undefined;
  private currentRteBatchId = '';
  private currentRtePageId = '';
  private expectedRteCompletions = 0;
  private completedRteCompletions = 0;
  private currentRteSummary = {
    requested: 0,
    succeeded: 0,
    failed: 0,
    maxDurationMs: 0,
    requestedUrls: new Set<string>(),
  };
  private completedRteComponentIds = new Set<string>();
  private rteBatchSequence = 0;

  public ngOnDestroy(): void {
    this.document.removeEventListener('rte-injector:content-requests-finished', this.onRteRequestsFinished);
  }

  public ngOnInit(): void {
    this.document.addEventListener('rte-injector:content-requests-finished', this.onRteRequestsFinished);

    this.route.data.subscribe((data) => {
      const routeData = data as DynamicPageRouteData;
      const pageId = String(routeData.pageId ?? '');
      const sourceRows = Array.isArray(routeData.components) ? routeData.components : [];
      const nextBatchId = this.createRteBatchId(pageId);
      const trackedRows = this.attachRteTracking(sourceRows, nextBatchId);
      this.resetRteBatchTracking(nextBatchId, pageId, trackedRows);

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

  private onRteRequestsFinished = (event: Event): void => {
    const detail = (event as CustomEvent<RteRequestsFinishedDetail>).detail;
    if (!detail || detail.batchId !== this.currentRteBatchId) {
      return;
    }

    const componentId = String(detail.componentId ?? '').trim();
    if (componentId.length === 0 || this.completedRteComponentIds.has(componentId)) {
      return;
    }

    this.completedRteComponentIds.add(componentId);
    this.completedRteCompletions += 1;
    this.currentRteSummary.requested += detail.requested;
    this.currentRteSummary.succeeded += detail.succeeded;
    this.currentRteSummary.failed += detail.failed;
    this.currentRteSummary.maxDurationMs = Math.max(this.currentRteSummary.maxDurationMs, detail.durationMs);

    for (const url of detail.requestedUrls ?? []) {
      this.currentRteSummary.requestedUrls.add(String(url));
    }

    if (this.completedRteCompletions < this.expectedRteCompletions) {
      return;
    }

    console.log('[dynamic-page] all RTE injector requests finished', {
      pageId: this.currentRtePageId,
      batchId: this.currentRteBatchId,
      injectorsExpected: this.expectedRteCompletions,
      injectorsCompleted: this.completedRteCompletions,
      requested: this.currentRteSummary.requested,
      succeeded: this.currentRteSummary.succeeded,
      failed: this.currentRteSummary.failed,
      durationMs: this.currentRteSummary.maxDurationMs,
      requestedUrls: Array.from(this.currentRteSummary.requestedUrls),
    });

    this.removeBootLoader();
  };

  private createRteBatchId(pageId: string): string {
    this.rteBatchSequence += 1;
    return `${pageId || 'no-page'}::${this.rteBatchSequence}`;
  }

  private resetRteBatchTracking(batchId: string, pageId: string, rows: PageLayoutRow[]): void {
    this.currentRteBatchId = batchId;
    this.currentRtePageId = pageId;
    this.expectedRteCompletions = this.countRteInjectorsWithFetches(rows);
    this.completedRteCompletions = 0;
    this.completedRteComponentIds.clear();
    this.currentRteSummary = {
      requested: 0,
      succeeded: 0,
      failed: 0,
      maxDurationMs: 0,
      requestedUrls: new Set<string>(),
    };
  }

  private attachRteTracking(rows: PageLayoutRow[], batchId: string): PageLayoutRow[] {
    return rows.map((row, rowIndex) => {
      const cols = (row?.cols ?? []).map((col, colIndex) => {
        if (String(col?.component ?? '') !== DynamicPageComponent.RTE_COMPONENT) {
          return col;
        }

        const config = this.getRteConfigFromCol(col);
        const trackedConfig = {
          ...config,
          __rteRequestBatchId: batchId,
          __rteRequestComponentId: `${rowIndex}:${colIndex}`,
        };

        return {
          ...col,
          config: trackedConfig,
        };
      });

      return { ...row, cols };
    });
  }

  private countRteInjectorsWithFetches(rows: PageLayoutRow[]): number {
    let total = 0;

    for (const row of rows) {
      for (const col of row?.cols ?? []) {
        if (String(col?.component ?? '') !== DynamicPageComponent.RTE_COMPONENT) {
          continue;
        }

        const config = this.getRteConfigFromCol(col);
        const hasFetches = this.getContentUrlEntries(config).length > 0;
        if (hasFetches) {
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

  private getRteConfigFromCol(col: PageLayoutCol): Record<string, unknown> {
    const nestedConfig = (col?.config ?? null) as Record<string, unknown> | null;
    const flatConfig = col as Record<string, unknown>;
    return nestedConfig ? { ...flatConfig, ...nestedConfig } : flatConfig;
  }

  private getContentUrlEntries(config: Record<string, unknown>): string[] {
    const htmlContentUrls = this.normalizeToStringArray(config['htmlContentURLs']);
    const legacyContentUrls = this.normalizeToStringArray(config['contentURLs']);
    return [...htmlContentUrls, ...legacyContentUrls];
  }

  private normalizeToStringArray(value: unknown): string[] {
    const values = Array.isArray(value) ? value : typeof value === 'string' ? [value] : [];
    return values
      .filter((entry): entry is string => typeof entry === 'string')
      .map((entry) => entry.trim())
      .filter((entry) => entry.length > 0);
  }

  private removeBootLoader(): void {
    this.document.getElementById('boot-loader')?.remove();
  }

}
