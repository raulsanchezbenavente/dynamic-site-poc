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
  // State signal: false until translations are loaded for the current flow.
  public readonly dynamicPageTranslationsLoaded = signal(false);
  private static readonly translationsReadyMarkerKey = '__dynamicPageTranslationsReadyMarker';

  private readonly readinessDocument = inject(DOCUMENT);
  private readonly readinessDestroyRef = inject(DestroyRef);
  private lastProcessedTranslationsMarker = 0;
  private readonly onTranslationsReady = (event: Event): void => {
    const detail = (event as CustomEvent<{ marker?: number }>).detail;
    const marker = Number(detail?.marker ?? this.readTranslationsReadyMarker());
    if (!Number.isFinite(marker) || marker <= this.lastProcessedTranslationsMarker) {
      return;
    }

    this.lastProcessedTranslationsMarker = marker;
    this.dynamicPageTranslationsLoaded.set(false);
    queueMicrotask(() => this.dynamicPageTranslationsLoaded.set(true));
  };
  private readonly _translationsReadyListener = this.registerTranslationsReadyListener();
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

  private registerTranslationsReadyListener(): true {
    this.readinessDocument.addEventListener('dynamic-page:translations-ready', this.onTranslationsReady);
    const marker = this.readTranslationsReadyMarker();
    if (marker > 0) {
      this.onTranslationsReady(new CustomEvent('dynamic-page:translations-ready', { detail: { marker } }));
    }
    this.readinessDestroyRef.onDestroy(() => {
      this.readinessDocument.removeEventListener('dynamic-page:translations-ready', this.onTranslationsReady);
    });

    return true;
  }

  private readTranslationsReadyMarker(): number {
    const doc = this.readinessDocument as Document & { [key: string]: unknown };
    const marker = Number(doc[DynamicPageReadinessBase.translationsReadyMarkerKey] ?? 0);
    return Number.isFinite(marker) ? marker : 0;
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
