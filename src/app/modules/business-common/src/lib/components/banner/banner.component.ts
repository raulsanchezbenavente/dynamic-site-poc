import { NgClass } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnInit,
  QueryList,
  TemplateRef,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import {
  accessibilityHelper,
  CurrencyService,
  defaultCurrency,
  EventBusService,
  GenerateIdPipe,
  PointOfSale,
  PointOfSaleService,
} from '@dcx/ui/libs';
import { TranslateModule } from '@ngx-translate/core';
import { filter, Subject } from 'rxjs';

import { BannerControlsComponent } from './components/molecules/banner-controls/banner-controls.component';
import { BannerItemComponent } from './components/molecules/banner-item/banner-item.component';
import { BannerAnimationEffect, BannerType } from './enums';
import { BannerAnimationConfig, BannerConfigParams, BannerControlsConfig, BannerItemConfig } from './models';
import { TranslationKeys } from './enums/translation-keys.enum';

@Component({
  selector: 'banner',
  templateUrl: './banner.component.html',
  styleUrls: ['./styles/banner.styles.scss'],
  host: {
    class: 'banner',
  },
  imports: [TranslateModule, BannerControlsComponent, BannerItemComponent, NgClass],
  standalone: true,
})
export class BannerComponent implements OnInit, AfterViewInit {
  protected readonly translationKeys = TranslationKeys;

  @Input({ required: true }) public config!: BannerConfigParams;

  @ViewChild('imagePopUpTemplate') public imagePopUpTemplate!: TemplateRef<unknown>;
  @ViewChildren('slides') public slides!: QueryList<ElementRef>;

  public filteredItems: BannerItemConfig[];
  public pointOfSale: PointOfSale | null = null;
  public currency: string;
  public bannerControlsConfig!: BannerControlsConfig;
  public pausedAnimation: boolean;
  public animation: BannerAnimationConfig;
  public _selectedSlideIndex: number;
  public isFocused: boolean;
  public areBannerElementsFocused: boolean;
  public currentSlide: HTMLElement;
  public previousSlide: HTMLElement;
  public isFullWidth: boolean;
  public isCarousel: boolean;
  protected hasResponsiveSet = false;
  protected _isResponsive: boolean;
  private afterViewInitComplete = false;
  private readonly $unsubscribe: Subject<void> = new Subject<void>();

  constructor(
    private readonly eventBusService: EventBusService,
    private readonly pointOfSaleService: PointOfSaleService,
    private readonly currencyService: CurrencyService,
    protected generateId: GenerateIdPipe,
    private readonly cdRef: ChangeDetectorRef
  ) {
    this.filteredItems = [] as BannerItemConfig[];
    this.pointOfSale = {} as PointOfSale;
    this.currency = defaultCurrency.collectedCurrency;
    this.bannerControlsConfig = {} as BannerControlsConfig;
    this.pausedAnimation = false;
    this.animation = {} as BannerAnimationConfig;
    this._selectedSlideIndex = 0;
    this.isCarousel = false;
    this.hasResponsiveSet = false;
    this._isResponsive = false;
    this.isFocused = false;
    this.areBannerElementsFocused = false;
    this.currentSlide = {} as HTMLElement;
    this.previousSlide = {} as HTMLElement;
    this.isFullWidth = false;
  }

  @Input() public set isResponsive(value: boolean) {
    this._isResponsive = value;
    if (!this.hasResponsiveSet && value && this.afterViewInitComplete) {
      this.hasResponsiveSet = true;
    }
  }

  set selectedSlideIndex(newIndex: number) {
    this._selectedSlideIndex = newIndex;
    this.onChangeSelectedSlideIndex();
  }

  get isResponsive(): boolean {
    return this._isResponsive;
  }

  get selectedSlideIndex(): number {
    return this._selectedSlideIndex;
  }

  public ngOnInit(): void {
    this.internalInit();
  }

  public ngAfterViewInit(): void {
    this.afterViewInitComplete = true;

    this.selectedSlideIndex = 0;
  }

  public changeSlide(index: number): void {
    this.selectedSlideIndex = index;
  }

  public changePaused(paused: boolean): void {
    this.pausedAnimation = paused;
  }

  public onFullClickFocus(): void {
    this.isFocused = true;
  }

  public onFullClickBlur(): void {
    this.isFocused = false;
  }

  public onFocusIn(): void {
    this.areBannerElementsFocused = true;
  }

  public onFocusOut(): void {
    this.areBannerElementsFocused = false;
  }

  protected internalInit(): void {
    this.config.animationCycleTime = this.config.animationCycleTime ?? 4000;
    this.config.animationEffect = this.config.animationEffect ?? BannerAnimationEffect.FADING;
    this.isFullWidth = this.config.isFullWidth || false;
    this.animation = {
      cycleTime: this.config.animationCycleTime ?? 4000,
      effect: this.config.animationEffect ?? BannerAnimationEffect.FADING,
    };
    this.config.accessibilityConfig = {
      id: this.generateId.transform('bannerId'),
    };
    this.config.ariaAttributes = {
      ariaLabel: this.config.bannerTitle,
    };
    this.registerEvents();
    this.pointOfSale = this.pointOfSaleService.getCurrentPointOfSale();
    if (this.pointOfSale?.currency?.code) {
      this.currency = this.pointOfSale.currency.code;
    }
    if (this.pointOfSale?.code) {
      this.filterConfig(this.pointOfSale.code);
    } else {
      this.filterConfig('');
    }
  }

  protected registerEvents(): void {
    this.subscribeToPointOfSaleChange();
    this.subscribeToCurrencySelected();
  }

  protected subscribeToCurrencySelected(): void {
    this.currencyService.currency$.pipe(filter((currency) => currency !== null)).subscribe((currency) => {
      this.currency = currency;
      this.cdRef.detectChanges();
    });
  }

  protected subscribeToPointOfSaleChange(): void {
    this.pointOfSaleService.pointOfSale$.subscribe((pointOfSale) => {
      if (!pointOfSale) {
        return;
      }
      this.pointOfSale = pointOfSale;
      this.currency = pointOfSale.currency.code;
      const pos = pointOfSale.code;
      this.filterConfig(pos);
      this.cdRef.detectChanges();
    });
  }

  private popupContainsImages(bannerConfig: BannerItemConfig): boolean {
    const popUpHasBgImage = !!bannerConfig.media.imageMedia?.bg.url;
    const popUpHasBgImageM = !!bannerConfig.media.imageMedia?.bgM?.url;
    const popUpHasBgImageL = !!bannerConfig.media.imageMedia?.bgL?.url;
    return popUpHasBgImage || popUpHasBgImageM || popUpHasBgImageL;
  }

  private filterConfig(posCode: string): void {
    if (this.config.bannerItems && posCode !== '') {
      this.filteredItems = this.config.bannerItems.filter(
        (item) =>
          (item.tags?.includes(posCode) || item.tags?.length === 0) &&
          item.content.bannerType !== BannerType.IMAGE_POPUP
      );
    } else {
      this.filteredItems = this.config.bannerItems ? this.config.bannerItems : ([] as BannerItemConfig[]);
    }
    this.isCarousel = this.filteredItems.length > 1;
    this.setBannerControls();
  }

  private setBannerControls(): void {
    this.bannerControlsConfig = {
      accessibilityConfig: this.config.accessibilityConfig,
      items: this.filteredItems,
      showControls: this.config.showControls,
      showPagination: this.config.showPagination,
    };
  }

  private onChangeSelectedSlideIndex(): void {
    if (!this.slides || this.slides.length === 0) return;

    const slidesArray = this.slides.toArray();
    if (!slidesArray[this.selectedSlideIndex]) return;

    this.getSlidesInteractiveElements(slidesArray);

    for (const [index, slide] of slidesArray.entries()) {
      const elem = slide.nativeElement;
      if (index === this.selectedSlideIndex) {
        accessibilityHelper.restoreElementAccessibility(elem);
      } else {
        accessibilityHelper.hideElementAccessibility(elem);
      }
    }
  }

  private getSlidesInteractiveElements(slides: ElementRef[]): void {
    this.currentSlide = slides[this.selectedSlideIndex].nativeElement;

    if (Object.keys(this.previousSlide).length === 0) {
      this.previousSlide = this.currentSlide;
    }
    const slideElements: HTMLElement[] = Array.from(this.previousSlide.querySelectorAll('*'));

    const interactiveElements = slideElements.filter(
      (element) => element.tabIndex > 0 || ['A'].includes(element.tagName)
    );

    if (this.bannerControlsConfig.showControls) {
      this.focusInPlayPauseButton(interactiveElements);
    }
    this.previousSlide = this.currentSlide;
  }

  private focusInPlayPauseButton(interactiveElements: HTMLElement[]): void {
    if (
      this.previousSlide !== this.currentSlide &&
      interactiveElements.includes(document.activeElement as HTMLElement)
    ) {
      const playPauseButtonElement = document.getElementById(
        this.bannerControlsConfig.accessibilityConfig.id + '_playPauseControlsId'
      );
      if (playPauseButtonElement) {
        playPauseButtonElement.focus();
      }
    }
  }
}
