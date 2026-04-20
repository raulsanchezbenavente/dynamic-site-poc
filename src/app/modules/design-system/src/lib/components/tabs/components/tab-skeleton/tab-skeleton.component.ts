import { Component, effect, input, signal } from '@angular/core';
import { SkeletonComponent } from '@dcx/ui/design-system';
import { EnumAnimationSkeleton, EnumAppearenceSkeleton, SkeletonConfig ,
  CommonTranslationKeys
} from '@dcx/ui/libs';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'tab-skeleton',
  templateUrl: './tab-skeleton.component.html',
  styleUrls: ['./styles/tab-skeleton.styles.scss'],
  host: { class: 'tab-skeleton' },
  imports: [SkeletonComponent, TranslatePipe],
  standalone: true,
})
export class TabSkeletonComponent {
  protected readonly CommonTranslationKeys = CommonTranslationKeys;

  public readonly config: SkeletonConfig = {
    animation: EnumAnimationSkeleton.PROGRESS,
    appearance: EnumAppearenceSkeleton.LINE,
  };

  public readonly isLoading = input.required<boolean>();
  public isLoadingData = signal(false);

  constructor() {
    effect(() => {
      const response = this.isLoading();
      this.isLoadingData.set(response);
    });
  }
}
