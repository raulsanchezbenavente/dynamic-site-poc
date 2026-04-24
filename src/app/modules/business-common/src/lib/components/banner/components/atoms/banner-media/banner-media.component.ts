import { Component, Inject, Input } from '@angular/core';
import { BANNER_BREAKPOINT_CONFIG, IBannerImageBreakpointsConfig } from '@dcx/ui/libs';

import { BannerMediaConfig } from '../../../models';

@Component({
  selector: 'banner-media',
  templateUrl: './banner-media.component.html',
  host: { class: 'banner-media' },
  imports: [],
  standalone: true,
})
export class BannerMediaComponent {
  @Input() public config!: BannerMediaConfig;

  constructor(
    @Inject(BANNER_BREAKPOINT_CONFIG)
    public bannerConfig: IBannerImageBreakpointsConfig
  ) {}
}
