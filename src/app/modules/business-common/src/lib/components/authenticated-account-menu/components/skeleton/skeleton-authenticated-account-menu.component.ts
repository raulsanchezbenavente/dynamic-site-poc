import { Component } from '@angular/core';
import { SkeletonComponent } from '@dcx/storybook/design-system';
import { EnumAppearenceSkeleton, SkeletonConfig } from '@dcx/ui/libs';

@Component({
  selector: 'skeleton-authenticated-account-menu',
  templateUrl: './templates/skeleton-authenticated-account-menu.html',
  styleUrls: ['./styles/skeleton-authenticated-account-menu.scss'],
  imports: [SkeletonComponent],
  standalone: true,
})
export class SkeletonAuthenticatedAccountMenuComponent {
  protected skeletonConfig: SkeletonConfig = {
    appearance: EnumAppearenceSkeleton.CUSTOM_CONTENT,
  };
}
