import { DOCUMENT } from '@angular/common';
import { inject } from '@angular/core';

import { DynamicPageReadyState } from './models/dynamic-page-ready-state.enum';

export type DynamicPageReadyTrackingConfig = {
  __dynamicPageBatchId?: string;
  __dynamicPageComponentId?: string;
  __dynamicPageComponentName?: string;
};

export abstract class DynamicPageReadinessBase {
  public static readonly dynamicPageReadiness = 'self-managed' as const;

  private readonly readinessDocument = inject(DOCUMENT);
  private lastReadyKey = '';

  protected emitDynamicPageReady(
    config: unknown,
    fallbackComponent: string,
    state: DynamicPageReadyState,
    extraDetail?: Record<string, unknown>
  ): void {
    this.emitDynamicPageReadyEvent({
      config: (config ?? null) as Record<string, unknown> | null,
      fallbackComponent: fallbackComponent,
      state,
      extraDetail,
    });
  }

  protected emitDynamicPageReadyEvent(options: {
    config: Record<string, unknown> | null | undefined;
    fallbackComponent: string;
    state: DynamicPageReadyState;
    extraDetail?: Record<string, unknown>;
  }): boolean {
    const tracking = this.resolveTracking(options.config, options.fallbackComponent);
    if (!tracking) {
      return false;
    }

    const readyKey = `${tracking.batchId}::${tracking.componentId}`;
    if (this.lastReadyKey === readyKey) {
      return false;
    }

    this.lastReadyKey = readyKey;

    this.readinessDocument.dispatchEvent(
      new CustomEvent('dynamic-page:component-ready', {
        detail: {
          ...tracking,
          state: options.state,
          ...(options.extraDetail ?? {}),
        },
      })
    );

    return true;
  }

  private resolveTracking(
    config: Record<string, unknown> | null | undefined,
    fallbackComponent: string
  ): { batchId: string; componentId: string; component: string } | null {
    const cfg = config ?? null;
    const batchId = String(cfg?.['__dynamicPageBatchId'] ?? '').trim();
    const componentId = String(cfg?.['__dynamicPageComponentId'] ?? '').trim();
    const component = String(cfg?.['__dynamicPageComponentName'] ?? fallbackComponent).trim();

    if (!batchId || !componentId || !component) {
      return null;
    }

    return { batchId, componentId, component };
  }
}
