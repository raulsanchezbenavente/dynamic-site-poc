import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { CommonTranslationKeys, LinkTarget } from '@dcx/ui/libs';
import { IconButtonComponent } from '../../../icon-button/icon-button.component';
import { IconButtonConfig } from '../../../icon-button/models/icon-button.model';
import { OffCanvasHeaderConfig } from '../../models/off-canvas-config.model';

@Component({
  selector: 'off-canvas-header',
  templateUrl: './off-canvas-header.component.html',
  styleUrls: ['./styles/off-canvas-header.styles.scss'],
  host: { class: 'ds-off-canvas-header' },
  encapsulation: ViewEncapsulation.None,
  imports: [CommonModule, TranslateModule, IconButtonComponent],
  standalone: true,
})
export class OffCanvasHeaderComponent implements OnInit {
  @Input() public config!: OffCanvasHeaderConfig;
  @Input() public closeButtonConfig?: Partial<IconButtonConfig>;
  @Output() private readonly closeClicked = new EventEmitter<void>();

  protected readonly translateService = inject(TranslateService);
  protected readonly linkTarget = LinkTarget;

  public resolvedCloseButtonConfig!: Partial<IconButtonConfig>;

  public ngOnInit(): void {
    this.setConfig(this.closeButtonConfig);
  }

  public onClose(): void {
    this.closeClicked.emit();
  }

  private setConfig(config?: Partial<IconButtonConfig>): void {
    this.resolvedCloseButtonConfig = {
      ...config,
      ariaAttributes: {
        ariaLabel: this.translateService.instant(CommonTranslationKeys.Common_Close),
      },
      icon: {
        ...config?.icon,
        name: 'cross',
        ariaAttributes: {
          ...config?.icon?.ariaAttributes,
        },
      },
    };
  }
}
