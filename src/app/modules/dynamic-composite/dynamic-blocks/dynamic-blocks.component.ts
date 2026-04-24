import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { BlockOutletComponent } from '../block-outlet/block-outlet.component';

@Component({
  selector: 'dynamic-blocks',
  standalone: true,
  imports: [CommonModule, BlockOutletComponent],
  templateUrl: './dynamic-blocks.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DynamicBlocksComponent {
  public blocks = input<any[] | null | undefined>(undefined);

  public getInputs(block: any): Record<string, any> {
    if (!block) return {};
    const { component, config, ...inputs } = block;
    return inputs;
  }

  public trackByKey(index: number, block: any): string {
    const component = this.getComponentId(block?.component);
    return block?.id ?? block?.name ?? `${component || 'cmp'}-${index}`;
  }

  private getComponentId(component: unknown): string {
    if (!component || typeof component !== 'object') {
      return '';
    }

    const componentId = (component as Record<string, unknown>)['id'];
    return typeof componentId === 'string' || typeof componentId === 'number' ? String(componentId).trim() : '';
  }
}
