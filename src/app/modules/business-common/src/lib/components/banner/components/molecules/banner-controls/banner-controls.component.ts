import { NgClass } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { BannerAnimationEffect } from '../../../enums';
import { BannerAnimationConfig } from '../../../models/banner-animation.config.model';
import { BannerControlsConfig } from '../../../models/banner-controls.config.model';

@Component({
  selector: 'banner-controls',
  templateUrl: './banner-controls.component.html',
  styleUrls: ['./styles/banner-controls.styles.scss'],
  host: { class: 'banner-controls' },
  imports: [TranslateModule, NgClass],
  standalone: true,
})
export class BannerControlsComponent implements OnInit {
  @Input({ required: true }) public config!: BannerControlsConfig;
  @Input({ required: true }) public animation!: BannerAnimationConfig;
  @Output() public changeIndexEmitter = new EventEmitter<number>();
  @Output() public changePausedEmitter = new EventEmitter<boolean>();
  public selectedSlideIndex = 0;
  public pausedAnimation = false;
  public slideInterval: any;
  public paginationTabIndex = '-1';

  public ngOnInit(): void {
    this.internalInit();
  }

  public internalInit(): void {
    this.paginationTabIndex = this.config.showPagination ? '0' : '-1';
    this.initializeSlideInterval();
  }

  public manageSlideInterval(): void {
    this.pausedAnimation = !this.pausedAnimation;
    this.changePausedEmitter.emit(this.pausedAnimation);
    if (this.pausedAnimation) {
      this.clearSlideInterval();
    } else {
      this.initializeSlideInterval();
    }
  }

  public changeSlide(i: number | string): void {
    if (typeof i === 'number') {
      this.selectedSlideIndex = i;
      this.changeIndexEmitter.emit(this.selectedSlideIndex);
    }

    if (i === 'next') {
      const nextIndex = this.selectedSlideIndex < this.config.items.length - 1 ? this.selectedSlideIndex + 1 : 0;
      this.changeSlide(nextIndex);
      return;
    }

    if (i === 'prev') {
      const prevIndex = this.selectedSlideIndex === 0 ? this.config.items.length - 1 : this.selectedSlideIndex - 1;
      this.changeSlide(prevIndex);
      return;
    }

    if (!this.pausedAnimation) {
      this.slidingEffect();
      this.initializeSlideInterval();
    }
  }

  private clearSlideInterval(): void {
    clearInterval(this.slideInterval);
  }

  private slidingEffect(): boolean {
    if (this.animation.effect === BannerAnimationEffect.SLIDING) {
      const nextSlide = this.selectedSlideIndex % this.config.items.length;
      const carouselElem = document.getElementById(this.config.accessibilityConfig.id + '_bannerSliderId');
      if (carouselElem) {
        carouselElem.style.transform = `translateX(-${nextSlide * 100}%)`;
        return true;
      }
      return false;
    } else {
      return false;
    }
  }

  private initializeSlideInterval(): void {
    if (this.config.items.length > 1) {
      clearInterval(this.slideInterval);
      this.slideInterval = setInterval(() => {
        const nextSlide = this.selectedSlideIndex + 1 < this.config.items.length ? this.selectedSlideIndex + 1 : 0;
        this.changeSlide(nextSlide);
        this.slidingEffect();
      }, this.animation.cycleTime);
    }
  }
}
