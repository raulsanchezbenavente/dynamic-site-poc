import { AfterViewInit, Component, ElementRef, Inject, Input, OnInit, ViewChild } from '@angular/core';
import { BANNER_BREAKPOINT_CONFIG, IBannerImageBreakpointsConfig } from '@dcx/ui/libs';

import { BannerCanPlay } from '../../../enums';
import { BannerMediaConfig } from '../../../models';

@Component({
  selector: 'banner-media',
  templateUrl: './banner-media.component.html',
  host: { class: 'banner-media' },
  imports: [],
  standalone: true,
})
export class BannerMediaComponent implements AfterViewInit, OnInit {
  @ViewChild('videoPlayer') public videoPlayer!: ElementRef;
  @Input() public config!: BannerMediaConfig;
  private intersectionObserver: IntersectionObserver;

  constructor(
    @Inject(BANNER_BREAKPOINT_CONFIG)
    public bannerConfig: IBannerImageBreakpointsConfig
  ) {
    this.intersectionObserver = {} as IntersectionObserver;
  }

  public ngOnInit(): void {
    this.checkVideoSupport();
  }

  public ngAfterViewInit(): void {
    if ('IntersectionObserver' in globalThis) {
      this.intersectionObserver = new IntersectionObserver(this.intersectionHandler.bind(this), { threshold: 0.2 });
      if (this.intersectionObserver && this.videoPlayer) {
        this.intersectionObserver.observe(this.videoPlayer.nativeElement);
      }
    }
  }

  public intersectionHandler(entries: IntersectionObserverEntry[]): void {
    const isVisible = entries[0].isIntersecting;
    if (isVisible && this.config.videoMedia?.upload.autoplay) {
      this.videoPlayer.nativeElement.play();
    } else {
      this.videoPlayer.nativeElement.pause();
    }
  }

  private changeVideoToPicture(): void {
    this.config.imageMedia = this.config.videoMedia?.fallbackImage;
  }

  private checkVideoSupport(): void {
    if (this.config.videoMedia) {
      const video = document.createElement('video');
      video.src = this.config.videoMedia.upload.url;
      video.onloadedmetadata = (): void => {
        const canPlay = video.canPlayType('video/' + this.config.videoMedia?.upload.extension);
        if (!(canPlay === BannerCanPlay.PROBABLY || canPlay === BannerCanPlay.MAYBE)) {
          this.changeVideoToPicture();
        }
      };
      video.onerror = (): void => {
        this.changeVideoToPicture();
      };
    }
  }
}
