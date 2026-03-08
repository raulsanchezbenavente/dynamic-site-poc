import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, input, signal, Type } from '@angular/core';

import { loadBlockComponent } from '../../component-map';

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
  public block = input<any | null | undefined>(undefined);
  public isLoading = signal(false);
  private readonly resolvedComponent = signal<Type<unknown> | null>(null);
  private loadSequence = 0;

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

  public inputs = computed<Record<string, any>>(() => {
    const b = this.block();
    if (!b) return {};
    const { component, span, ...rest } = b;
    return rest;
  });
}
