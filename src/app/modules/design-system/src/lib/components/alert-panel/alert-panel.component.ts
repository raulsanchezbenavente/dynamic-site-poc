import { LowerCasePipe, NgClass, TitleCasePipe } from '@angular/common';
import { Component, computed, input, ViewEncapsulation } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { AlertPanelType } from './enums/alert-panel-type.enum';
import { AlertPanelConfig } from './models/alert-panel.config';
import { CommonTranslationKeys } from '@dcx/ui/libs';

@Component({
  selector: 'alert-panel',
  templateUrl: './alert-panel.component.html',
  styleUrls: ['./styles/alert-panel.styles.scss'],
  encapsulation: ViewEncapsulation.None,
  imports: [TranslateModule, NgClass, TitleCasePipe, LowerCasePipe],
  standalone: true,
})
export class AlertPanelComponent {
  protected readonly CommonTranslationKeys = CommonTranslationKeys;

  public readonly config = input.required<Partial<AlertPanelConfig>>();

  /**
   * Optional ID for the alert panel element.
   * Useful when the parent needs to reference this element (e.g., aria-labelledby).
   */
  public readonly id = input<string>();

  public readonly resolvedConfig = computed(() => {
    const inputConfig = this.config();
    return {
      alertType: AlertPanelType.NEUTRAL,
      ...inputConfig,
      ariaAttributes: {
        ...inputConfig.ariaAttributes,
      },
    };
  });
}
