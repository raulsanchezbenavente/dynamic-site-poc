import { Component, Input, OnInit } from '@angular/core';
import { DescriptionList, DescriptionListComponent, DescriptionListPriceData } from '@dcx/ui/design-system';
import { SummaryTotalConfig, SummaryTotalData } from '@dcx/ui/libs';

import { SummaryDetailsConfig } from '../summary-details/models/summary-details.config';
import { SummaryTotalComponent } from '../summary-total/summary-total.component';

@Component({
  selector: 'summary-price-details',
  templateUrl: './summary-price-details.component.html',
  styleUrls: ['./styles/summary-price-details.style.scss'],
  imports: [SummaryTotalComponent, DescriptionListComponent],
  standalone: true,
})
export class SummaryPriceDetailsComponent implements OnInit {
  public summaryTotalConfig: SummaryTotalConfig;
  public summaryTotalData: SummaryTotalData;
  public descriptionListDetails: DescriptionList;

  @Input() public config!: SummaryDetailsConfig;
  @Input() public descriptionList!: DescriptionList[];
  @Input() public descriptionListSummaryTotal!: DescriptionList[];

  constructor() {
    this.summaryTotalConfig = {} as SummaryTotalConfig;
    this.summaryTotalData = {} as SummaryTotalData;
    this.descriptionListDetails = {} as DescriptionList;
  }

  public ngOnInit(): void {
    this.internalInit();
  }

  public internalInit(): void {
    const copieDescriptionList = this.descriptionList.slice();
    this.descriptionListDetails = copieDescriptionList.shift()!;
    this.buildSummaryTotalConfig();
  }

  protected buildSummaryTotalConfig(): void {
    const summaryTotalDetails = this.descriptionListSummaryTotal.slice().shift();
    const summaryTotalDetailsItem = summaryTotalDetails?.options[0].description as DescriptionListPriceData;
    this.summaryTotalData = {
      amount: summaryTotalDetailsItem.price,
      currency: summaryTotalDetailsItem.currency,
    };

    this.summaryTotalConfig = {
      label: summaryTotalDetails!.options[0].term,
    };
  }
}
