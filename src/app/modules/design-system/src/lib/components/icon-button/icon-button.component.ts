import { Component, computed, EventEmitter, input, OnInit, Output } from '@angular/core';
import { MergeConfigsService } from '@dcx/ui/libs';

import { IconComponent } from '../icon/icon.component';

import { IconButtonConfig } from './models/icon-button.model';

@Component({
  selector: 'icon-button',
  templateUrl: './icon-button.component.html',
  styleUrls: ['./styles/icon-button.styles.scss'],
  host: {
    class: 'ds-icon-button',
  },
  imports: [IconComponent],
  standalone: true,
})
export class IconButtonComponent implements OnInit {
  @Output() private readonly clickEvent = new EventEmitter<void>();

  public config = input<Partial<IconButtonConfig> | undefined>(undefined);

  // Internal defaults
  private readonly defaultConfig: IconButtonConfig = {
    icon: {
      name: 'cross',
    },
    ariaAttributes: {
      ariaDisabled: false,
    },
  };

  public resolvedConfig = computed<Partial<IconButtonConfig>>(() => {
    const incoming = this.config();
    return this.mergeConfigsService.mergeConfigs(this.defaultConfig, incoming);
  });

  public ariaPressed?: boolean;
  public ariaExpanded?: boolean;

  constructor(private readonly mergeConfigsService: MergeConfigsService) {}

  public ngOnInit(): void {
    this.assertA11y();
  }

  public onClick(): void {
    const config = this.resolvedConfig();
    if (!config?.ariaAttributes?.ariaDisabled) {
      if (config?.ariaAttributes?.hasOwnProperty('ariaExpanded')) this.ariaExpanded = !this.ariaExpanded;
      if (config?.ariaAttributes?.hasOwnProperty('ariaPressed')) this.ariaPressed = !this.ariaPressed;
      this.clickEvent.emit();
    }
  }

  /**
   * A11y safeguard: warns (dev mode) if an icon-only button lacks an accessible name.
   * Icon buttons MUST provide ariaLabel via ariaAttributes. Without it screen readers announce only "button".
   * Does not throw to avoid breaking runtime; relied on during development.
   */
  private assertA11y(): void {
    const cfg = this.config();
    if (cfg?.icon && !cfg?.ariaAttributes?.ariaLabel) {
      if (ngDevMode) {
        console.warn(
          '[IconButtonComponent] Missing ariaLabel in ariaAttributes for icon-only button. Move ariaLabel from IconConfig and add it to IconButton config'
        );
      }
    }
  }
}
