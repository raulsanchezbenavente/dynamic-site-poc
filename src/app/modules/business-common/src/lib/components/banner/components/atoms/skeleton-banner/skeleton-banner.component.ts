import { Component } from '@angular/core';
import { SkeletonComponent } from '@dcx/storybook/design-system';

@Component({
  selector: 'skeleton-banner',
  templateUrl: './skeleton-banner.component.html',
  styleUrls: ['./styles/skeleton-banner.styles.scss'],
  imports: [SkeletonComponent],
  standalone: true,
})
export class SkeletonBannerComponent {}
