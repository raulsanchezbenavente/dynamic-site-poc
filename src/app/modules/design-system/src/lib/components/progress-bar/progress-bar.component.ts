import { Component, Input, OnChanges, OnInit, SimpleChanges, ViewEncapsulation } from '@angular/core';

import { ProgressBarConfig } from './models/progress-bar.config';

@Component({
  selector: 'progress-bar',
  templateUrl: './progress-bar.component.html',
  styleUrls: ['./styles/progress-bar.styles.scss'],
  encapsulation: ViewEncapsulation.None,
  imports: [],
    standalone: true
})
export class ProgressBarComponent implements OnInit, OnChanges {
  @Input({ required: true }) public config!: ProgressBarConfig;
  public isCompleted: boolean = false;
  public isStart: boolean = true;

  constructor() {}
  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['config']?.currentValue) {
      this.updateState();
    }
  }
  public ngOnInit(): void {
    this.internalInit();
  }
  public calculatePercentage(): string {
    const minValue = this.config?.min?.value ?? 0;
    const maxValue = this.config?.max?.value ?? 100;
    const currentValue = this.config?.currentValue ?? minValue;

    if (currentValue <= minValue) return '0%';
    if (currentValue >= maxValue) return '100%';

    const calculatedPercentage = ((currentValue - minValue) / (maxValue - minValue)) * 100;
    return `${calculatedPercentage.toFixed(2)}%`;
  }
  public get percentage(): string {
    return this.calculatePercentage();
  }
  protected internalInit(): void {
    this.updateState();
  }
  private updateState(): void {
    const numericPercentage = Number.parseFloat(this.percentage);
    this.isCompleted = numericPercentage >= 100;
    this.isStart = numericPercentage < 5;
  }
}
