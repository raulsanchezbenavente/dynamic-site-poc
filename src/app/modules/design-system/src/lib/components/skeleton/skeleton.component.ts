import { Component, Input } from '@angular/core';
import { EnumAnimationSkeleton, EnumAppearenceSkeleton, SkeletonConfig } from '@dcx/ui/libs';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';

@Component({
  selector: 'ds-skeleton',
  templateUrl: './skeleton.component.html',
  styleUrls: ['./styles/skeleton.styles.scss'],
  imports: [NgxSkeletonLoaderModule],
  standalone: true,
})
export class SkeletonComponent {
  public animation = EnumAnimationSkeleton.PROGRESS;
  public appearance = EnumAppearenceSkeleton.LINE;

  @Input() public config: SkeletonConfig = {
    animation: this.animation,
    appearance: this.appearance,
    count: 1,
  };
}
