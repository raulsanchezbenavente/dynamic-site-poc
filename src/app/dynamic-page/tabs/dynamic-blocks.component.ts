import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { componentMap } from '../../component-map';

@Component({
  selector: 'ds-dynamic-blocks',
  standalone: true,
  imports: [CommonModule],
  template: `
    <ng-container *ngFor="let block of blocks(); trackBy: trackByKey">
      <ng-container
        *ngComponentOutlet="componentMap[block.component]; inputs: getInputs(block)">
      </ng-container>
    </ng-container>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DsDynamicBlocksComponent {
  blocks = input<any[] | null | undefined>(undefined);

  componentMap = componentMap;

  getInputs(block: any): Record<string, any> {
    if (!block) return {};
    const { component, span, ...inputs } = block;
    return inputs;
  }

  trackByKey(index: number, block: any): string {
    // si en tu contrato existe algún id, úsalo aquí
    return block?.id ?? block?.name ?? `${block?.component ?? 'cmp'}-${index}`;
  }
}
