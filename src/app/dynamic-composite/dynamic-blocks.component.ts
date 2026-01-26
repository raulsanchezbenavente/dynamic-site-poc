import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { DsBlockOutletComponent } from './dynamic-page/ds-block-outlet.component';
// import { componentMap } from '../component-map';

@Component({
  selector: 'ds-dynamic-blocks',
  standalone: true,
  imports: [CommonModule, DsBlockOutletComponent],
  template: `
    @for (block of blocks(); track trackByKey) {
      <ds-block-outlet [block]="block"></ds-block-outlet>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DsDynamicBlocksComponent {
  public blocks = input<any[] | null | undefined>(undefined);

  public getInputs(block: any): Record<string, any> {
    if (!block) return {};
    const { component, span, ...inputs } = block;
    return inputs;
  }

  public trackByKey(index: number, block: any): string {
    return block?.id ?? block?.name ?? `${block?.component ?? 'cmp'}-${index}`;
  }
}
