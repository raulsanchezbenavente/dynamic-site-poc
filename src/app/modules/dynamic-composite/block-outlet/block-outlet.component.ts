import { CommonModule, DOCUMENT } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  HostBinding,
  inject,
  InjectionToken,
  input,
  signal,
  Type,
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { queueTranslationsByRenderedComponent } from './block-outlet-translations.helper';

export type BlockComponentLoader = () => Promise<Type<unknown>>;
export type BlockComponentMap = Record<string, BlockComponentLoader>;
export type BlockComponentRegistry = {
  componentMap: BlockComponentMap;
  loadBlockComponent: (key: string) => Promise<Type<unknown> | null>;
  getConfigInputName?: (key: string) => string | undefined;
};

export const BLOCK_COMPONENT_REGISTRY = new InjectionToken<BlockComponentRegistry>('BLOCK_COMPONENT_REGISTRY');

const EMPTY_BLOCK_COMPONENT_REGISTRY: BlockComponentRegistry = {
  componentMap: {},
  loadBlockComponent: () => Promise.resolve(null),
};

type DynamicBlockInput = {
  component?: string;
  span?: number;
  config?: Record<string, unknown>;
  __dynamicPageBatchId?: string;
  __dynamicPageComponentId?: string;
  __dynamicPageComponentName?: string;
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
  private readonly blockComponentRegistry =
    inject(BLOCK_COMPONENT_REGISTRY, { optional: true }) ?? EMPTY_BLOCK_COMPONENT_REGISTRY;
  private readonly document = inject(DOCUMENT);
  private readonly http = inject(HttpClient);
  private readonly translateService = inject(TranslateService);
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

      queueTranslationsByRenderedComponent({
        batchId: this.toText(b?.__dynamicPageBatchId),
        componentKey: key,
        http: this.http,
        translateService: this.translateService,
      });

      const currentLoad = ++this.loadSequence;
      this.isLoading.set(true);

      void this.blockComponentRegistry
        .loadBlockComponent(key)
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
    const componentKey = this.toText(b.component);

    const rest: Record<string, unknown> = { ...(b as Record<string, unknown>) };
    const batchId = this.toText(rest['__dynamicPageBatchId']);
    const componentId = this.toText(rest['__dynamicPageComponentId']);
    const componentName = this.toText(rest['__dynamicPageComponentName']);
    const configInputName = this.getConfigInputName(componentKey);

    delete rest['component'];
    delete rest['span'];
    delete rest['__dynamicPageBatchId'];
    delete rest['__dynamicPageComponentId'];
    delete rest['__dynamicPageComponentName'];

    if (configInputName !== 'config' && Object.hasOwn(rest, 'config')) {
      if (!Object.hasOwn(rest, configInputName)) {
        rest[configInputName] = rest['config'];
      }
      delete rest['config'];
    }

    if (!this.selfManagedReadiness() || !batchId || !componentId || !componentName) {
      return rest;
    }

    const configCandidate = rest[configInputName];
    const config =
      configCandidate && typeof configCandidate === 'object' ? { ...(configCandidate as Record<string, unknown>) } : {};

    config['__dynamicPageBatchId'] = batchId;
    config['__dynamicPageComponentId'] = componentId;
    config['__dynamicPageComponentName'] = componentName;
    rest[configInputName] = config;

    return rest;
  });

  private getConfigInputName(componentKey: string): string {
    const configured = this.blockComponentRegistry.getConfigInputName?.(componentKey);
    const normalized = String(configured ?? '').trim();
    return normalized.length > 0 ? normalized : 'config';
  }

  private isSelfManagedReadyComponent(component: Type<unknown> | null): boolean {
    const maybeReadyManaged = component as ReadyManagedComponentType | null;
    return maybeReadyManaged?.dynamicPageReadiness === 'self-managed';
  }

  private normalizeAttributeValue(value: unknown): string | null {
    const text = this.toText(value).replace(/^_+/, '');
    return text.length > 0 ? text : null;
  }

  private toText(value: unknown): string {
    if (typeof value === 'string') {
      return value.trim();
    }

    if (typeof value === 'number' || typeof value === 'boolean') {
      return String(value).trim();
    }

    return '';
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
