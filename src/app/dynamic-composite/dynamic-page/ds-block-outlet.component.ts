import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { componentMap } from '../../component-map';

@Component({
  selector: 'ds-block-outlet',
  standalone: true,
  imports: [CommonModule],
  template: `
    <ng-container *ngIf="cmp() as c; else missing">
      <ng-container *ngComponentOutlet="c; inputs: inputs()"></ng-container>
    </ng-container>

    <ng-template #missing>
      <div style="padding:.5rem;border:1px dashed #bbb;background:#fff;margin-right: auto;margin-left: auto;width: 1100px;">
        Missing component: <b>{{ block()?.component }}</b>
      </div>
    </ng-template>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DsBlockOutletComponent {
  block = input<any | null | undefined>(undefined);

  cmp = computed(() => {
    const b = this.block();
    return b?.component ? componentMap[b.component] : undefined;
  });

  inputs = computed<Record<string, any>>(() => {
    const b = this.block();
    if (!b) return {};
    const { component, span, ...rest } = b;
    return rest;
  });
}
