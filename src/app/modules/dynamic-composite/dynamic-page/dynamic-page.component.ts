import { CommonModule, DOCUMENT } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { SeoService } from '@navigation';

import { BlockOutletComponent } from '../block-outlet/block-outlet.component';

type PageLayoutCol = {
  component: string;
  span?: number;
  config?: Record<string, unknown>;
  __dynamicPageBatchId?: string;
  __dynamicPageComponentId?: string;
  __dynamicPageComponentName?: string;
  [key: string]: unknown;
};
type PageLayoutRow = { cols: PageLayoutCol[] };
type PageTab = {
  layout?: { rows?: PageLayoutRow[] } | PageLayoutRow[];
  [key: string]: unknown;
};
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

type TranslationsReadyDetail = {
  batchId?: string;
};

@Component({
  selector: 'dynamic-page',
  standalone: true,
  imports: [CommonModule, BlockOutletComponent],
  templateUrl: './dynamic-page.component.html',
})
export class DynamicPageComponent implements OnInit, OnDestroy {
  private static readonly LOCALIZED_COMPONENTS = new Set(['rteBlock_uiplus']);
  private static readonly TABS_COMPONENT = 'multiTabBlock_uiplus';

  public rows: PageLayoutRow[] = [];

  private document = inject(DOCUMENT);
  private route = inject(ActivatedRoute);
  private titleService = inject(Title);
  private seoSvc = inject(SeoService);
  private currentPageId: string | undefined;
  private currentBatchId = '';
  private currentBatchPageId = '';
  private expectedCompletions = 0;
  private expectedComponentIds = new Set<string>();
  private completedCompletions = 0;
  private completedComponentIds = new Set<string>();
  private translationsReadyForCurrentBatch = false;
  private batchSequence = 0;

  public ngOnInit(): void {
    this.document.addEventListener('dynamic-page:component-ready', this.onComponentReady);
    this.document.addEventListener('dynamic-page:translations-ready', this.onTranslationsReady);

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

  public ngOnDestroy(): void {
    this.document.removeEventListener('dynamic-page:component-ready', this.onComponentReady);
    this.document.removeEventListener('dynamic-page:translations-ready', this.onTranslationsReady);
  }

  public getInputs(col: PageLayoutCol): Record<string, unknown> {
    return Object.fromEntries(Object.entries(col).filter(([key]) => key !== 'component' && key !== 'span')) as Record<
      string,
      unknown
    >;
  }

  public hasRteInjector(row: PageLayoutRow): boolean {
    return (row?.cols ?? []).some((col) => col?.component === 'rteBlock_uiplus');
  }

  private onComponentReady = (event: Event): void => {
    const detail = (event as CustomEvent<ComponentReadyDetail>).detail;
    if (!detail || detail.batchId !== this.currentBatchId) {
      return;
    }

    const componentId = String(detail.componentId ?? '').trim();
    if (componentId.length === 0 || !this.expectedComponentIds.has(componentId)) {
      return;
    }

    if (this.completedComponentIds.has(componentId)) {
      return;
    }

    this.completedComponentIds.add(componentId);
    this.completedCompletions += 1;
    this.tryFinalizePageReady();
  };

  private onTranslationsReady = (event: Event): void => {
    const detail = (event as CustomEvent<TranslationsReadyDetail>).detail;
    if (detail?.batchId !== this.currentBatchId) {
      return;
    }

    this.translationsReadyForCurrentBatch = true;
    this.tryFinalizePageReady();
  };

  private tryFinalizePageReady(): void {
    if (!this.translationsReadyForCurrentBatch) {
      return;
    }

    if (this.completedCompletions < this.expectedCompletions) {
      return;
    }

    this.logAndFinalizePageReady();
  }

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
    this.expectedComponentIds = this.collectTrackedComponentIds(rows);
    this.expectedCompletions = this.expectedComponentIds.size;
    this.completedCompletions = 0;
    this.completedComponentIds.clear();
    this.translationsReadyForCurrentBatch = false;
  }

  private attachComponentTracking(rows: PageLayoutRow[], batchId: string): PageLayoutRow[] {
    let sequence = 0;

    const nextComponentId = (): string => {
      sequence += 1;
      return `component:${sequence}`;
    };

    return this.attachRowsTracking(rows, batchId, nextComponentId);
  }

  private attachRowsTracking(rows: PageLayoutRow[], batchId: string, nextComponentId: () => string): PageLayoutRow[] {
    return rows.map((row) => {
      const cols = (row?.cols ?? []).map((col) => this.attachColTracking(col, batchId, nextComponentId));
      return { ...row, cols };
    });
  }

  private attachColTracking(col: PageLayoutCol, batchId: string, nextComponentId: () => string): PageLayoutCol {
    const componentName = String(col?.component ?? '').trim();
    if (!componentName) {
      return col;
    }

    if (componentName === DynamicPageComponent.TABS_COMPONENT) {
      const tabsConfig = this.resolveTabsConfig(col.config);
      return {
        ...col,
        config: {
          ...(col.config ?? {}),
          ...tabsConfig,
          tabs: this.attachTabsTracking(tabsConfig.tabs, batchId, nextComponentId),
        },
      };
    }

    return {
      ...col,
      __dynamicPageBatchId: batchId,
      __dynamicPageComponentId: nextComponentId(),
      __dynamicPageComponentName: componentName,
    };
  }

  private resolveTabsConfig(config: Record<string, unknown> | undefined): {
    tabsId?: string;
    tabs: PageTab[];
  } {
    const tabsId = String(config?.['tabsId'] ?? '').trim() || undefined;
    const tabs = Array.isArray(config?.['tabs']) ? (config?.['tabs'] as PageTab[]) : [];
    return { tabsId, tabs };
  }

  private attachTabsTracking(tabs: PageTab[] | undefined, batchId: string, nextComponentId: () => string): PageTab[] {
    if (!Array.isArray(tabs)) {
      return [];
    }

    return tabs.map((tab) => {
      const layoutRows = this.resolveTabLayoutRows(tab.layout);
      const trackedRows = this.attachRowsTracking(layoutRows, batchId, nextComponentId);

      if (Array.isArray(tab.layout)) {
        return { ...tab, layout: trackedRows };
      }

      return {
        ...tab,
        layout: {
          ...(tab.layout ?? {}),
          rows: trackedRows,
        },
      };
    });
  }

  private resolveTabLayoutRows(layout: PageTab['layout']): PageLayoutRow[] {
    if (Array.isArray(layout)) {
      return layout;
    }

    return Array.isArray(layout?.rows) ? layout.rows : [];
  }

  private collectTrackedComponentIds(rows: PageLayoutRow[]): Set<string> {
    const trackedIds = new Set<string>();
    this.collectTrackedIdsFromRows(rows, trackedIds);
    return trackedIds;
  }

  private collectTrackedIdsFromRows(rows: PageLayoutRow[], trackedIds: Set<string>): void {
    for (const row of rows) {
      for (const col of row?.cols ?? []) {
        const componentId = String(col?.__dynamicPageComponentId ?? '').trim();
        if (componentId.length > 0) {
          trackedIds.add(componentId);
        }

        const componentName = String(col?.component ?? '').trim();
        const tabs = this.resolveTabsConfig(col?.config).tabs;
        if (componentName !== DynamicPageComponent.TABS_COMPONENT || tabs.length === 0) {
          continue;
        }

        for (const tab of tabs) {
          this.collectTrackedIdsFromRows(this.resolveTabLayoutRows(tab.layout), trackedIds);
        }
      }
    }
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
    requestAnimationFrame(() => {
      this.document.getElementById('boot-loader')?.remove();
    });
  }
}
