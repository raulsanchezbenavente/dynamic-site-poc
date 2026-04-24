import { Component, ContentChild, EventEmitter, Input, OnInit, Output, TemplateRef } from '@angular/core';
import { NgStyle, NgTemplateOutlet } from '@angular/common';
import { GenericData, KeyCodeEnum, PriceRange, RangeSliderConfig } from '@dcx/ui/libs';
import { PriceCurrencyComponent } from "../price-currency/price-currency.component";

@Component({
  selector: 'range-slider',
  templateUrl: './range-slider.component.html',
  styleUrls: ['styles/range-slider.styles.scss'],
  imports: [
    PriceCurrencyComponent,
    NgStyle,
    NgTemplateOutlet,
  ],
  standalone: true
})
export class RangeSliderComponent implements OnInit {
  @Input({ required: true }) public config!: RangeSliderConfig;

  @Output() public valueEmitter = new EventEmitter<PriceRange>();

  @ContentChild('componentData', { read: false })
  public componentDataTemplateRef!: TemplateRef<any>;

  @Input() set applyClear(value: GenericData<boolean>) {
    if (!value) {
      return;
    }
    if (value.data) {
      this.ngOnInit();
    }
  }

  public ngOnInit(): void {
    this.getSelectedValuePercentage();
    this.disableIfValuesAreEqual();
    const priceRange = {
      minValue: this.config.minValue,
      maxValue: this.config.maxValueSelected,
    } as PriceRange;
    this.valueEmitter.emit(priceRange);
  }

  public onValueChange(event: Event, arrow?: string): void {
    this.config.maxValueSelected = Number.parseFloat((event.target as HTMLInputElement).value);
    if (arrow && arrow === KeyCodeEnum.ARROW_LEFT) {
      this.config.maxValueSelected = Number.parseFloat((event.target as HTMLInputElement).value) - this.config.steps;
    } else if (arrow && arrow === KeyCodeEnum.ARROW_RIGHT) {
      this.config.maxValueSelected = Number.parseFloat((event.target as HTMLInputElement).value) + this.config.steps;
    }
    this.getSelectedValuePercentage();
    const priceRange = {
      minValue: this.config.minValue,
      maxValue: this.config.maxValueSelected,
    } as PriceRange;
    this.valueEmitter.emit(priceRange);
  }

  public onKeyDown(event: KeyboardEvent): void {
    switch (event.key) {
      case KeyCodeEnum.ARROW_LEFT:
      case KeyCodeEnum.ARROW_RIGHT:
        this.onValueChange(event, event.key);
        break;
      default:
        break;
    }
  }

  private getSelectedValuePercentage(): void {
    const diferenceValuePercent = (this.config.maxValueSelected - this.config.minValue) * 100;
    const diferenceValue = this.config.maxValue - this.config.minValue;
    this.config.selectedPercentage = diferenceValuePercent / diferenceValue;
  }

  private disableIfValuesAreEqual(): void {
    if (this.config.minValue === this.config.maxValue) {
      this.config.isDisabled = true;
    }
  }
}
