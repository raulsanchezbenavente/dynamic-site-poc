import { NgClass } from '@angular/common';
import { Component, Inject, Input, OnInit, Optional, ViewEncapsulation } from '@angular/core';
import { DsNgbTriggerEvent, MergeConfigsService, TooltipConfig } from '@dcx/ui/libs';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';

import { TOOLTIP_CONFIG } from './tokens/tooltip-default-config.token';

@Component({
  selector: 'tooltip',
  templateUrl: './tooltip.component.html',
  styleUrls: ['./styles/tooltip.styles.scss'],
  encapsulation: ViewEncapsulation.None,
  host: { class: 'ds-tooltip' },
  imports: [NgbTooltip, NgClass],
  standalone: true,
})
export class TooltipComponent implements OnInit {
  @Input() public config!: Partial<TooltipConfig>;

  public autoClose!: boolean;

  constructor(
    private readonly mergeConfigsService: MergeConfigsService,
    @Inject(TOOLTIP_CONFIG)
    @Optional()
    private readonly defaultConfig: TooltipConfig
  ) {}

  public ngOnInit(): void {
    this.initDefaultConfiguration();
  }

  protected initDefaultConfiguration(): void {
    this.config = this.mergeConfigsService.mergeConfigs(this.defaultConfig, this.config);
    if (this.config.triggerEvent === DsNgbTriggerEvent.CLICK) {
      this.autoClose = true;
    }
    if (this.config.iconOnly) {
      this.config.hiddenTriggerText = true;
    }
  }
}
