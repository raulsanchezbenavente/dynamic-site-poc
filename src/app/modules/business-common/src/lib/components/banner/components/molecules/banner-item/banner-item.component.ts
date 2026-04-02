import { NgClass, NgSwitch, NgSwitchCase, NgSwitchDefault, NgTemplateOutlet } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { PriceCurrencyComponent, TitleHeading } from '@dcx/ui/design-system';
import { EnumVerticalAlign, GenerateIdPipe, HorizontalAlign, LayoutSize } from '@dcx/ui/libs';
import { TranslateService } from '@ngx-translate/core';

import { BannerItemStyle } from '../../../enums';
import { BannerItemConfig } from '../../../models/banner-item.config.model';
import { LowestPriceConfig } from '../../../models/lowest-price.config.model';
import { BannerMediaComponent } from '../../atoms/banner-media/banner-media.component';

@Component({
  selector: 'banner-item',
  templateUrl: './banner-item.component.html',
  styleUrls: ['./styles/banner-item.styles.scss'],
  host: {
    class: 'banner-item',
  },
  imports: [
    BannerMediaComponent,
    PriceCurrencyComponent,
    NgClass,
    NgTemplateOutlet,
    NgSwitch,
    NgSwitchCase,
    NgSwitchDefault,
  ],
  standalone: true,
})
export class BannerItemComponent implements OnChanges, OnInit, AfterViewInit {
  @Input({ required: true }) public config!: BannerItemConfig;
  @Input({ required: true }) public index!: number;
  @Input({ required: true }) public isCarouselItem!: boolean;
  @Input() public selectedSlideIndex!: number;
  @Input() public currency!: string;
  @Output() public fullClickFocus = new EventEmitter<void>();
  @Output() public fullClickBlur = new EventEmitter<void>();

  @ViewChild('bannerItemCaptionFootnote')
  public bannerItemCaptionFootnote!: ElementRef;

  public lowestPrice!: LowestPriceConfig;
  public layoutClasses: string[];
  public id: string;
  public titleHeading = TitleHeading;
  private readonly layoutClassPrefix = 'banner-item-html--';
  private isMouseDownFullClick = false;

  protected translate = inject(TranslateService);

  constructor(protected generateId: GenerateIdPipe) {
    this.id = this.generateId.transform('bannerItemId');
    this.layoutClasses = [];
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['currency']) {
      this.internalInit();
    }
  }

  public ngOnInit(): void {
    this.internalInit();
  }

  public ngAfterViewInit(): void {
    this.setLinksTabIndex(this.config.content.footnote);
  }

  public onClick(item: BannerItemConfig): boolean {
    if (item.configuration.isFullAreaClickable) {
      globalThis.open(item.configuration.link?.url, item.configuration.link?.target ?? '_self');
      return true;
    } else {
      return false;
    }
  }

  public onFullClickMouseDown(): void {
    this.isMouseDownFullClick = true;
  }

  public onFullClickFocus(): void {
    if (!this.isMouseDownFullClick) {
      this.fullClickFocus.emit();
    }
  }

  public onFullClickBlur(): void {
    this.isMouseDownFullClick = false;
    this.fullClickBlur.emit();
  }

  protected internalInit(): void {
    this.setLowestPrice();

    this.layoutClasses = this.layoutStyleClasses();
    if (this.hasVideoMedia()) {
      this.layoutClasses.push('banner-item-html--has-video');
    }
  }

  private setLowestPrice(): void {
    if (this.config.content.lowestPrice) {
      this.lowestPrice = {
        currency: this.currency,
        price: this.config.content.lowestPrice[this.currency],
        isEnabled: this.config.configuration.enableLowestPrice && this.config.content.lowestPrice[this.currency] > 0,

        label: this.translate.instant('Banner.LowestPrice_Label'),
      };
    } else {
      this.lowestPrice = {
        currency: this.currency,
        price: 0,
        isEnabled: false,

        label: this.translate.instant('Banner.LowestPrice_Label'),
      };
    }
  }

  private layoutStyleClasses(): string[] {
    const listClass = [
      `${this.layoutClassPrefix}style-${this.getBannerStyle()}`,
      `${this.layoutClassPrefix}halign-${this.getHorizontalAlign()}`,
      `${this.layoutClassPrefix}valign-${this.getVerticalAlign()}`,
      `${this.layoutClassPrefix}fontsize-${this.getFontSize()}`,
    ];

    if (this.config.sectionColors) {
      listClass.push(`${this.layoutClassPrefix}${this.config.sectionColors}`);
    }

    return listClass;
  }

  private getBannerStyle(): string {
    return this.config.layout.bannerStyle ? this.config.layout.bannerStyle : BannerItemStyle.DEFAULT;
  }

  private getHorizontalAlign(): string {
    return this.config.layout.horizontalAlign ? this.config.layout.horizontalAlign : HorizontalAlign.CENTER;
  }

  private getVerticalAlign(): string {
    return this.config.layout.verticalAlign ?? EnumVerticalAlign.MIDDLE;
  }

  private getFontSize(): string {
    return this.config.layout?.fontSize ?? LayoutSize.MEDIUM;
  }

  private hasVideoMedia(): boolean {
    return !!this.config.media.videoMedia;
  }

  private setLinksTabIndex(text: string | undefined): void {
    if (this.bannerItemCaptionFootnote && text) {
      this.bannerItemCaptionFootnote.nativeElement.innerHTML = text;
      const isHidden = this.isCarouselItem ? this.selectedSlideIndex !== this.index : false;
      if (isHidden) {
        const links = this.bannerItemCaptionFootnote.nativeElement.querySelectorAll('a');
        for (const link of links) {
          link.setAttribute('tabindex', '-1');
        }
      }
    }
  }
}
