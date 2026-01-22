import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { componentMap } from '../../component-map';
import { DsBlockOutletComponent } from '../dynamic-page/ds-block-outlet.component';

@Component({
  selector: 'ds-dynamic-blocks',
  standalone: true,
  imports: [CommonModule, DsBlockOutletComponent],
  template: `
    <ng-container *ngFor="let block of blocks(); trackBy: trackByKey">
      <ds-block-outlet [block]="block"></ds-block-outlet>
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
