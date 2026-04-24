import { Component } from '@angular/core';
import { SkeletonComponent } from '@dcx/storybook/design-system';
import { EnumAnimationSkeleton, EnumAppearenceSkeleton, SkeletonConfig } from '@dcx/ui/libs';

@Component({
  selector: 'skeleton-upcoming-trips',
  templateUrl: './skeleton-upcoming-trips.component.html',
  styleUrls: ['./styles/skeleton-upcoming-trips.styles.scss'],
  host: {
    class: 'skeleton-upcoming-trips',
  },
  imports: [SkeletonComponent],
  standalone: true,
})
export class SkeletonUpcomingTripsComponent {
  public skeletonConfig: SkeletonConfig = {
    appearance: EnumAppearenceSkeleton.LINE,
    animation: EnumAnimationSkeleton.PROGRESS_DARK,
  };
}
