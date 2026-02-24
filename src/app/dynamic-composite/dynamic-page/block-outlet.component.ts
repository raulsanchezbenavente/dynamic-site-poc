import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, input, signal, Type } from '@angular/core';

import { componentMap } from '../../component-map';

const componentCache = new Map<string, Type<any>>();

@Component({
  selector: 'block-outlet',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (cmp(); as c) {
      <ng-container *ngComponentOutlet="c; inputs: inputs()"></ng-container>
    } @else if (isLoading()) {
      <div
        style="padding:.75rem;border:1px dashed #e0e0e0;background:#fafafa;margin-right:auto;margin-left:auto;border-radius:6px;">
        <div
          style="height:12px;background:linear-gradient(90deg,#eee,#f5f5f5,#eee);background-size:200% 100%;border-radius:6px;animation:skeleton 1.2s ease-in-out infinite;"></div>
        <div
          style="height:12px;margin-top:8px;width:70%;background:linear-gradient(90deg,#eee,#f5f5f5,#eee);background-size:200% 100%;border-radius:6px;animation:skeleton 1.2s ease-in-out infinite;"></div>
        <div
          style="height:12px;margin-top:8px;width:40%;background:linear-gradient(90deg,#eee,#f5f5f5,#eee);background-size:200% 100%;border-radius:6px;animation:skeleton 1.2s ease-in-out infinite;"></div>
      </div>
    } @else {
      <div style="padding:.5rem;border:1px dashed #bbb;background:#fff;margin-right: auto;margin-left: auto;">
        Missing component: <b>{{ block()?.component }}</b>
      </div>
    }
  `,
  styles: [
    `
      @keyframes skeleton {
        0% {
          background-position: 200% 0;
        }
        100% {
          background-position: -200% 0;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BlockOutletComponent {
  public block = input<any | null | undefined>(undefined);

  public cmp = signal<Type<any> | undefined>(undefined);
  public isLoading = signal(false);
  public isMissing = signal(false);

  private loadId = 0;

  constructor() {
    effect(() => {
      const block = this.block();
      const key = block?.component;
      const loadId = ++this.loadId;

      if (!key) {
        this.cmp.set(undefined);
        this.isLoading.set(false);
        this.isMissing.set(false);
        return;
      }

      const cached = componentCache.get(key);
      if (cached) {
        this.cmp.set(cached);
        this.isLoading.set(false);
        this.isMissing.set(false);
        return;
      }

      const loader = componentMap[key];
      if (!loader) {
        this.cmp.set(undefined);
        this.isLoading.set(false);
        this.isMissing.set(true);
        return;
      }

      this.cmp.set(undefined);
      this.isLoading.set(true);
      this.isMissing.set(false);

      loader()
        .then((component) => {
          if (this.loadId !== loadId) return;
          componentCache.set(key, component);
          this.cmp.set(component);
        })
        .catch(() => {
          if (this.loadId !== loadId) return;
          this.cmp.set(undefined);
          this.isMissing.set(true);
        })
        .finally(() => {
          if (this.loadId !== loadId) return;
          this.isLoading.set(false);
        });
    });
  }

  public inputs = computed<Record<string, any>>(() => {
    const b = this.block();
    if (!b) return {};
    const { component, span, ...rest } = b;
    return rest;
  });
}
