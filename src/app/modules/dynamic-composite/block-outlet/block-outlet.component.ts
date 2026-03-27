import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, HostBinding, input, signal, Type } from '@angular/core';
import { loadBlockComponent } from 'src/app/component-map';

type DynamicBlockInput = {
  component?: string;
  span?: number;
  [key: string]: unknown;
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
        this.isLoading.set(false);
        return;
      }

      const currentLoad = ++this.loadSequence;
      this.isLoading.set(true);

      void loadBlockComponent(key)
        .then((component) => {
          if (this.loadSequence !== currentLoad) return;
          this.resolvedComponent.set(component ?? null);
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
    delete rest.component;
    delete rest.span;
    return rest;
  });

  private normalizeAttributeValue(value: unknown): string | null {
    const text = String(value ?? '')
      .trim()
      .replace(/^_+/, '');
    return text.length > 0 ? text : null;
  }
}
