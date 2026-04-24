import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, ViewEncapsulation } from '@angular/core';
import { TextHelperService ,
  CommonTranslationKeys
} from '@dcx/ui/libs';
import { TranslateService } from '@ngx-translate/core';

import { StatusTagStyles } from './enums/status-tag-styles.enum';
import { StatusTagType } from './enums/status-tag-type.enum';
import { StatusTagConfig } from './models/status-tag.config';

const DEFAULT_CONFIG: StatusTagConfig = {
  status: StatusTagType.DEFAULT,
  style: StatusTagStyles.DEFAULT,
  text: 'Add status tag text',
};

/**
 * Standalone component for displaying status indicators with semantic styles.
 */
@Component({
  selector: 'status-tag',
  templateUrl: './status-tag.component.html',
  styleUrls: ['./styles/status-tag.styles.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgClass],
  standalone: true,
})
export class StatusTagComponent<TStatus extends string = StatusTagType> {
  public readonly config = input.required<StatusTagConfig<TStatus>>();

  private readonly translate = inject(TranslateService);
  private readonly textHelper = inject(TextHelperService);

  protected readonly mergedConfig = computed(() => ({
    ...DEFAULT_CONFIG,
    ...this.config(),
  }));

  protected readonly styleClasses = computed(() => {
    const config = this.mergedConfig();
    const statusKebab = this.textHelper.toKebabCase(config.status);

    return {
      [`status-tag--type-${statusKebab}`]: true,
      [`status-tag--style-${config.style}`]: !!config.style,
      'status-tag--no-icon': config.style === StatusTagStyles.NO_ICON,
    };
  });

  protected readonly iconAriaLabel = computed(() => {
    const status = this.mergedConfig().status;
    const titleCased = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
    return this.translate.instant(`${CommonTranslationKeys.Common_A11y_Status_Icon_KeyNode}${titleCased}`);
  });

  protected readonly StatusTagStyles = StatusTagStyles;
}
