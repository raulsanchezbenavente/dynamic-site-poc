import { DOCUMENT } from '@angular/common';
import { DestroyRef, inject, signal } from '@angular/core';

import { DynamicPageReadyState } from './models/dynamic-page-ready-state.enum';

export type DynamicPageReadyTrackingConfig = {
  __dynamicPageBatchId?: string;
  __dynamicPageComponentId?: string;
  __dynamicPageComponentName?: string;
};

export abstract class DynamicPageReadinessBase {
  public static readonly dynamicPageReadiness = 'self-managed' as const;
  public readonly dynamicPageTranslationsLoaded = signal(false);

  private readonly readinessDocument = inject(DOCUMENT);
  private readonly readinessDestroyRef = inject(DestroyRef);
  private readonly loadedTranslationBatchIds = new Set<string>();
  private readonly onTranslationsReady = (event: Event): void => {
    const detail = (event as CustomEvent<{ batchId?: string }>).detail;
    const batchId = this.toTrimmedString(detail?.batchId);
    if (!batchId) {
      return;
    }

    this.loadedTranslationBatchIds.add(batchId);

    if (batchId === this.currentTrackedBatchId) {
      this.dynamicPageTranslationsLoaded.set(true);
    }
  };
  private lastReadyKey = '';
  private currentTrackedBatchId = '';
  private readonly _translationsReadyListener = this.registerTranslationsReadyListener();

  protected emitDynamicPageReady(
    config: unknown,
    fallbackComponent: string,
    state: DynamicPageReadyState,
    extraDetail?: Record<string, unknown>
  ): void {
    this.syncDynamicPageTranslationsState(config);

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
    this.syncDynamicPageTranslationsState(options.config);

    const tracking = this.resolveTracking(options.config, options.fallbackComponent);
    if (!tracking) {
      return false;
    }

    const readyKey = `${tracking.batchId}::${tracking.componentId}`;
    if (this.lastReadyKey === readyKey) {
      return false;
    }

    this.lastReadyKey = readyKey;

    const detail = options.extraDetail
      ? {
          ...tracking,
          state: options.state,
          ...options.extraDetail,
        }
      : {
          ...tracking,
          state: options.state,
        };

    this.readinessDocument.dispatchEvent(
      new CustomEvent('dynamic-page:component-ready', {
        detail,
      })
    );

    return true;
  }

  protected syncDynamicPageTranslationsState(config: unknown): void {
    const batchId = this.resolveBatchId(config);
    if (!batchId) {
      return;
    }

    this.currentTrackedBatchId = batchId;
    this.dynamicPageTranslationsLoaded.set(this.loadedTranslationBatchIds.has(batchId));
  }

  private registerTranslationsReadyListener(): true {
    this.readinessDocument.addEventListener('dynamic-page:translations-ready', this.onTranslationsReady);
    this.readinessDestroyRef.onDestroy(() => {
      this.readinessDocument.removeEventListener('dynamic-page:translations-ready', this.onTranslationsReady);
    });

    return true;
  }

  private resolveBatchId(config: unknown): string {
    const cfg = (config ?? null) as Record<string, unknown> | null;
    return this.toTrimmedString(cfg?.['__dynamicPageBatchId']);
  }

  private toTrimmedString(value: unknown): string {
    if (typeof value === 'string') {
      return value.trim();
    }

    if (typeof value === 'number' || typeof value === 'boolean') {
      return String(value).trim();
    }

    return '';
  }

  private resolveTracking(
    config: Record<string, unknown> | null | undefined,
    fallbackComponent: string
  ): { batchId: string; componentId: string; component: string } | null {
    const cfg = config ?? null;
    const batchId = this.toTrimmedString(cfg?.['__dynamicPageBatchId']);
    const componentId = this.toTrimmedString(cfg?.['__dynamicPageComponentId']);
    const component = this.toTrimmedString(cfg?.['__dynamicPageComponentName']) || fallbackComponent;

    if (!batchId || !componentId || !component) {
      return null;
    }

    return { batchId, componentId, component: component.trim() };
  }
}
