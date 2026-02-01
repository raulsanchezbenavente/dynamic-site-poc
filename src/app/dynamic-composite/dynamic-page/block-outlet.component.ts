import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { componentMap } from '../../component-map';

@Component({
  selector: 'block-outlet',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (cmp(); as c) {
      <ng-container *ngComponentOutlet="c; inputs: inputs()"></ng-container>
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

  public cmp = computed(() => {
    const b = this.block();
    return b?.component ? componentMap[b.component] : undefined;
  });

  public inputs = computed<Record<string, any>>(() => {
    const b = this.block();
    if (!b) return {};
    const { component, span, ...rest } = b;
    return rest;
  });
}
