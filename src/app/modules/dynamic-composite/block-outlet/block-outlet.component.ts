import { CommonModule, DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, HostBinding, inject, input, signal, Type } from '@angular/core';
import { loadBlockComponent } from 'src/app/component-map';

type DynamicBlockInput = {
  component?: string;
  span?: number;
  [key: string]: unknown;
};

type ReadyManagedComponentType = Type<unknown> & {
  dynamicPageReadiness?: 'self-managed';
};

type ComponentReadyDetail = {
  batchId: string;
  componentId: string;
  component: string;
  state: 'rendered' | 'missing';
};

@Component({
  selector: 'block-outlet',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (cmp(); as c) {
      <ng-container *ngComponentOutlet="c; inputs: inputs()"></ng-container>
    } @else if (isLoading()) {
      <div style="padding:.5rem;border:1px dashed #bbb;background:#fff;margin-right:auto;margin-left:auto;">
        Loading component: <b>{{ block()?.component }}</b>
      </div>
    } @else {
      <div style="padding:.5rem;border:1px dashed #bbb;background:#fff;margin-right: auto;margin-left: auto;">
        Missing component: <b>{{ block()?.component }}</b>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BlockOutletComponent {
  public block = input<DynamicBlockInput | null | undefined>(undefined);
  public isLoading = signal(false);
  private readonly resolvedComponent = signal<Type<unknown> | null>(null);
  private readonly selfManagedReadiness = signal(false);
  private readonly document = inject(DOCUMENT);
  private loadSequence = 0;

  @HostBinding('attr.data-dynamic-component-map-name')
  public get dynamicComponentMapName(): string | null {
    const mapName = this.block()?.component;
    return this.normalizeAttributeValue(mapName);
  }

  @HostBinding('attr.data-dynamic-component-class-name')
  public get dynamicComponentClassName(): string | null {
    const className = this.resolvedComponent()?.name;
    return this.normalizeAttributeValue(className);
  }

  constructor() {
    effect(() => {
      const b = this.block();
      const key = b?.component;

      if (!key) {
        this.resolvedComponent.set(null);
        this.selfManagedReadiness.set(false);
        this.isLoading.set(false);
        return;
      }

      const currentLoad = ++this.loadSequence;
      this.isLoading.set(true);

      void loadBlockComponent(key)
        .then((component) => {
          if (this.loadSequence !== currentLoad) return;

          const selfManaged = this.isSelfManagedReadyComponent(component);
          this.selfManagedReadiness.set(Boolean(component) && selfManaged);
          this.resolvedComponent.set(component ?? null);

          if (!component || !selfManaged) {
            this.emitComponentReady(component ? 'rendered' : 'missing');
          }
        })
        .finally(() => {
          if (this.loadSequence !== currentLoad) return;
          this.isLoading.set(false);
        });
    });
  }

  public cmp = computed(() => this.resolvedComponent());

  public inputs = computed<Record<string, unknown>>(() => {
    const b = this.block();
    if (!b) return {};

    const rest = { ...b };
    const batchId = String(rest['__dynamicPageBatchId'] ?? '').trim();
    const componentId = String(rest['__dynamicPageComponentId'] ?? '').trim();
    const componentName = String(rest['__dynamicPageComponentName'] ?? '').trim();

    delete rest.component;
    delete rest.span;
    delete rest['__dynamicPageBatchId'];
    delete rest['__dynamicPageComponentId'];
    delete rest['__dynamicPageComponentName'];

    if (!this.selfManagedReadiness() || !batchId || !componentId || !componentName) {
      return rest;
    }

    const configCandidate = rest['config'];
    const config =
      configCandidate && typeof configCandidate === 'object' ? { ...(configCandidate as Record<string, unknown>) } : {};

    config['__dynamicPageBatchId'] = batchId;
    config['__dynamicPageComponentId'] = componentId;
    config['__dynamicPageComponentName'] = componentName;
    rest['config'] = config;

    return rest;
  });

  private isSelfManagedReadyComponent(component: Type<unknown> | null): boolean {
    const maybeReadyManaged = component as ReadyManagedComponentType | null;
    return maybeReadyManaged?.dynamicPageReadiness === 'self-managed';
  }

  private normalizeAttributeValue(value: unknown): string | null {
    const text = String(value ?? '')
      .trim()
      .replace(/^_+/, '');
    return text.length > 0 ? text : null;
  }

  private emitComponentReady(state: 'rendered' | 'missing'): void {
    const block = this.block();
    const batchId = String(block?.['__dynamicPageBatchId'] ?? '').trim();
    const componentId = String(block?.['__dynamicPageComponentId'] ?? '').trim();
    const component = String(block?.component ?? '').trim();

    if (!batchId || !componentId || !component) {
      return;
    }

    const detail: ComponentReadyDetail = {
      batchId,
      componentId,
      component,
      state,
    };

    this.document.dispatchEvent(new CustomEvent<ComponentReadyDetail>('dynamic-page:component-ready', { detail }));
  }
}
