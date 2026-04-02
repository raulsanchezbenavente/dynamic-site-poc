import { Component, Input, OnInit } from '@angular/core';
import { SummaryDetailsBySection } from './models/summary-details-by-section.model';
import { SummaryDetailsSection } from './enums/summary-details-section.enum';
import { SummaryDetailsConfig } from './models/summary-details.config';
import { SummaryPriceDetailsComponent } from '../summary-price-details/summary-price-details.component';

@Component({
  selector: 'summary-details',
  templateUrl: './summary-details.component.html',
  styleUrls: ['./styles/summary-details.style.scss'],
  imports: [SummaryPriceDetailsComponent],
  standalone: true,
})
export class SummaryDetailsComponent implements OnInit {
  public descriptionListPrice: SummaryDetailsBySection;
  public descriptionListSummaryTotal: SummaryDetailsBySection;

  @Input() public config!: SummaryDetailsConfig;
  @Input() public descriptionListBySection!: SummaryDetailsBySection[];

  constructor() {
    this.descriptionListPrice = {} as SummaryDetailsBySection;
    this.descriptionListSummaryTotal = {} as SummaryDetailsBySection;
  }

  public ngOnInit(): void {
    this.internalInit();
  }

  public internalInit(): void {
    this.splitDescriptionListBySections();
  }

  public splitDescriptionListBySections(): void {
    this.descriptionListPrice = this.descriptionListBySection.find((x) => x.section === SummaryDetailsSection.PRICE)!;

    this.descriptionListSummaryTotal = this.descriptionListBySection.find(
      (x) => x.section === SummaryDetailsSection.TOTAL
    )!;
  }
}
