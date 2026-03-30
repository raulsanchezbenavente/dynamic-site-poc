import { Component, input } from '@angular/core';
import type { ButtonConfig } from '@dcx/ui/libs';

@Component({
  selector: 'ds-button',
  standalone: true,
  template: `
    <button
      type="button"
      class="btn"
      [disabled]="config()?.isDisabled">
      {{ config()?.label || 'Button' }}
    </button>
  `,
})
export class DsButtonComponent {
  public config = input<Partial<ButtonConfig> | undefined>(undefined);
}
