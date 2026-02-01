import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { BlockOutletComponent } from './dynamic-page/block-outlet.component';

@Component({
  selector: 'dynamic-blocks',
  standalone: true,
  imports: [CommonModule, BlockOutletComponent],
  template: `
    @for (block of blocks(); track trackByKey($index, block)) {
      <block-outlet [block]="block"></block-outlet>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DynamicBlocksComponent {
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
