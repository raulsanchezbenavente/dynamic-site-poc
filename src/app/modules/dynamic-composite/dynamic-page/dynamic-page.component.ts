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
  private static readonly CONTENT_SOURCE_KEYS = [
    'htmlContent',
    'htmlContentURLs',
    'content',
    'contentURLs',
    'styles',
    'cssURLs',
    'css',
  ] as const;

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
        this.refreshContentSourceBlocks(routeData.components);
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

  private refreshContentSourceBlocks(nextRowsCandidate: PageLayoutRow[] | undefined): void {
    const nextRows = Array.isArray(nextRowsCandidate) ? nextRowsCandidate : [];
    if (this.rows.length === 0 || nextRows.length === 0) {
      return;
    }

    let anyContentSourceUpdated = false;

    for (const [rowIndex, currentRow] of this.rows.entries()) {
      const nextRow = nextRows[rowIndex];
      if (!nextRow || !Array.isArray(nextRow.cols) || !Array.isArray(currentRow.cols)) {
        continue;
      }

      const colsLength = Math.min(currentRow.cols.length, nextRow.cols.length);
      for (let colIndex = 0; colIndex < colsLength; colIndex += 1) {
        const currentCol = currentRow.cols[colIndex];
        const nextCol = nextRow.cols[colIndex];

        if (!nextCol || nextCol.component !== currentCol.component) {
          continue;
        }

        if (!this.hasContentSourceDelta(currentCol, nextCol)) {
          continue;
        }

        // Replace only this block reference so Angular updates this outlet's inputs.
        currentRow.cols[colIndex] = nextCol;
        anyContentSourceUpdated = true;
      }
    }

    if (anyContentSourceUpdated) {
      // Preserve row references (avoid row-level rerender), only notify top-level change.
      this.rows = [...this.rows];
    }
  }

  private hasContentSourceDelta(currentCol: PageLayoutCol, nextCol: PageLayoutCol): boolean {
    const currentSignature = this.buildContentSourceSignature(currentCol);
    const nextSignature = this.buildContentSourceSignature(nextCol);
    return nextSignature.length > 0 && currentSignature !== nextSignature;
  }

  private buildContentSourceSignature(col: PageLayoutCol): string {
    const topLevelSignature = this.extractContentSourceSignature(col);
    const configSignature = this.extractContentSourceSignature(this.asRecordOrNull(col.config));
    return `${topLevelSignature}|${configSignature}`;
  }

  private extractContentSourceSignature(source: Record<string, unknown> | null): string {
    if (!source) {
      return '';
    }

    const chunks: string[] = [];

    for (const key of DynamicPageComponent.CONTENT_SOURCE_KEYS) {
      if (!Object.prototype.hasOwnProperty.call(source, key)) {
        continue;
      }

      chunks.push(`${key}:${this.stableSerialize(source[key])}`);
    }

    return chunks.join('|');
  }

  private asRecordOrNull(value: unknown): Record<string, unknown> | null {
    if (!value || typeof value !== 'object') {
      return null;
    }

    return value as Record<string, unknown>;
  }

  private stableSerialize(value: unknown): string {
    if (Array.isArray(value)) {
      return `[${value.map((item) => this.stableSerialize(item)).join(',')}]`;
    }

    if (value && typeof value === 'object') {
      const asRecord = value as Record<string, unknown>;
      const keys = Object.keys(asRecord).sort();
      return `{${keys.map((key) => `${JSON.stringify(key)}:${this.stableSerialize(asRecord[key])}`).join(',')}}`;
    }

    return JSON.stringify(value);
  }
}
