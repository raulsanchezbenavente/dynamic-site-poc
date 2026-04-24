import { Component, ElementRef, inject, input, OnInit, signal, ViewChild } from '@angular/core';
import { SkeletonComponent } from '@dcx/storybook/design-system';
import {
  EnumAnimationSkeleton,
  EnumAppearenceSkeleton,
  ResizeSvc,
  SkeletonConfig,
  SliderBreakpointsConfig,
} from '@dcx/ui/libs';

@Component({
  selector: 'skeleton-past-trips',
  templateUrl: './skeleton-past-trips.component.html',
  styleUrls: ['./styles/skeleton-past-trips.styles.scss'],
  imports: [SkeletonComponent],
  standalone: true,
})
export class SkeletonPastTripsComponent implements OnInit {
  @ViewChild('track', { static: true }) public trackRef!: ElementRef<HTMLDivElement>;
  public readonly config = input<SliderBreakpointsConfig>();
  public visibleItems = signal<number>(3);

  public skeletonConfig: SkeletonConfig = {
    appearance: EnumAppearenceSkeleton.LINE,
    animation: EnumAnimationSkeleton.PROGRESS_DARK,
  };

  private readonly resizeService = inject(ResizeSvc);

  public ngOnInit(): void {
    this.internalInit();
  }

  private internalInit(): void {
    this.subscribeToResize();
  }

  private subscribeToResize(): void {
    if (this.config()) {
      this.resizeService.layout$.subscribe((size) => {
        this.visibleItems.set(this.config()![size as keyof SliderBreakpointsConfig]?.visibleItems as number);

        this.trackRef.nativeElement.style.setProperty('--skeleton-visible-items', this.visibleItems().toString());
      });
    }
  }
}
