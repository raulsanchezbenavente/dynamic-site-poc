import { TestBed } from '@angular/core/testing';

import { DynamicPageReadinessBase } from './dynamic-page-readiness.base';
import { DynamicPageReadyState } from './models/dynamic-page-ready-state.enum';

class TestDynamicPageReadiness extends DynamicPageReadinessBase {
  public emit(options: {
    config: Record<string, unknown> | null | undefined;
    fallbackComponent: string;
    state: DynamicPageReadyState;
    extraDetail?: Record<string, unknown>;
  }): boolean {
    return this.emitDynamicPageReadyEvent(options);
  }
}

describe('DynamicPageReadinessBase', () => {
  let subject: TestDynamicPageReadiness;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    subject = TestBed.runInInjectionContext(() => new TestDynamicPageReadiness());
  });

  it('should expose self-managed readiness marker', () => {
    expect(TestDynamicPageReadiness.dynamicPageReadiness).toBe('self-managed');
  });

  it('should expose translation-loaded signal defaulting to false', () => {
    expect(subject.dynamicPageTranslationsLoaded()).toBeFalse();
  });

  it('should emit dynamic-page:component-ready with fallback component and extra detail', () => {
    const dispatchSpy = spyOn(document, 'dispatchEvent').and.callThrough();

    const emitted = subject.emit({
      config: {
        __dynamicPageBatchId: 'batch-1',
        __dynamicPageComponentId: 'cmp-1',
      },
      fallbackComponent: 'fallback-block',
      state: DynamicPageReadyState.LOADED,
      extraDetail: {
        requested: 3,
        failed: 0,
      },
    });

    expect(emitted).toBeTrue();
    expect(dispatchSpy).toHaveBeenCalledTimes(1);

    const event = dispatchSpy.calls.mostRecent().args[0] as CustomEvent<Record<string, unknown>>;
    expect(event.type).toBe('dynamic-page:component-ready');
    expect(event.detail).toEqual(
      jasmine.objectContaining({
        batchId: 'batch-1',
        componentId: 'cmp-1',
        component: 'fallback-block',
        state: DynamicPageReadyState.LOADED,
        requested: 3,
        failed: 0,
      })
    );
  });

  it('should prefer explicit component name from config over fallback', () => {
    const dispatchSpy = spyOn(document, 'dispatchEvent').and.callThrough();

    const emitted = subject.emit({
      config: {
        __dynamicPageBatchId: 'batch-2',
        __dynamicPageComponentId: 'cmp-2',
        __dynamicPageComponentName: 'configured-block',
      },
      fallbackComponent: 'fallback-block',
      state: DynamicPageReadyState.RENDERED,
    });

    expect(emitted).toBeTrue();

    const event = dispatchSpy.calls.mostRecent().args[0] as CustomEvent<Record<string, unknown>>;
    expect(event.detail['component']).toBe('configured-block');
  });

  it('should not emit when batch or component id is missing', () => {
    const dispatchSpy = spyOn(document, 'dispatchEvent').and.callThrough();

    const missingBatch = subject.emit({
      config: {
        __dynamicPageComponentId: 'cmp-3',
      },
      fallbackComponent: 'fallback-block',
      state: DynamicPageReadyState.MISSING,
    });

    const missingComponent = subject.emit({
      config: {
        __dynamicPageBatchId: 'batch-3',
      },
      fallbackComponent: 'fallback-block',
      state: DynamicPageReadyState.MISSING,
    });

    expect(missingBatch).toBeFalse();
    expect(missingComponent).toBeFalse();
    expect(dispatchSpy).not.toHaveBeenCalled();
  });

  it('should dedupe repeated emissions for same batch and component id', () => {
    const dispatchSpy = spyOn(document, 'dispatchEvent').and.callThrough();

    const first = subject.emit({
      config: {
        __dynamicPageBatchId: 'batch-4',
        __dynamicPageComponentId: 'cmp-4',
      },
      fallbackComponent: 'fallback-block',
      state: DynamicPageReadyState.LOADED,
    });

    const duplicate = subject.emit({
      config: {
        __dynamicPageBatchId: 'batch-4',
        __dynamicPageComponentId: 'cmp-4',
      },
      fallbackComponent: 'fallback-block',
      state: DynamicPageReadyState.ERROR,
    });

    const differentComponent = subject.emit({
      config: {
        __dynamicPageBatchId: 'batch-4',
        __dynamicPageComponentId: 'cmp-5',
      },
      fallbackComponent: 'fallback-block',
      state: DynamicPageReadyState.LOADED,
    });

    expect(first).toBeTrue();
    expect(duplicate).toBeFalse();
    expect(differentComponent).toBeTrue();
    expect(dispatchSpy).toHaveBeenCalledTimes(2);
  });

  it('should set translation-loaded signal to true when tracked batch translations are ready', () => {
    subject.emit({
      config: {
        __dynamicPageBatchId: 'batch-5',
        __dynamicPageComponentId: 'cmp-6',
      },
      fallbackComponent: 'fallback-block',
      state: DynamicPageReadyState.LOADED,
    });

    expect(subject.dynamicPageTranslationsLoaded()).toBeFalse();

    document.dispatchEvent(
      new CustomEvent('dynamic-page:translations-ready', {
        detail: {
          batchId: 'batch-5',
        },
      })
    );

    expect(subject.dynamicPageTranslationsLoaded()).toBeTrue();
  });

  it('should ignore translation-ready events from a different batch', () => {
    subject.emit({
      config: {
        __dynamicPageBatchId: 'batch-6',
        __dynamicPageComponentId: 'cmp-7',
      },
      fallbackComponent: 'fallback-block',
      state: DynamicPageReadyState.LOADED,
    });

    document.dispatchEvent(
      new CustomEvent('dynamic-page:translations-ready', {
        detail: {
          batchId: 'other-batch',
        },
      })
    );

    expect(subject.dynamicPageTranslationsLoaded()).toBeFalse();
  });

  it('should keep translation-loaded signal true when translations were ready before tracking sync', () => {
    document.dispatchEvent(
      new CustomEvent('dynamic-page:translations-ready', {
        detail: {
          batchId: 'batch-7',
        },
      })
    );

    subject.emit({
      config: {
        __dynamicPageBatchId: 'batch-7',
        __dynamicPageComponentId: 'cmp-8',
      },
      fallbackComponent: 'fallback-block',
      state: DynamicPageReadyState.LOADED,
    });

    expect(subject.dynamicPageTranslationsLoaded()).toBeTrue();
  });
});
