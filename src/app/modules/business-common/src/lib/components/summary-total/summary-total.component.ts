import { Component, Input } from '@angular/core';
import { SummaryTotalConfig, SummaryTotalData } from '@dcx/ui/libs';
import { PriceCurrencyComponent } from '@dcx/storybook/design-system';

@Component({
  selector: 'summary-total',
  templateUrl: './summary-total.component.html',
  styleUrls: ['./styles/summary-total.style.scss'],
  imports: [PriceCurrencyComponent],
    standalone: true
})
export class SummaryTotalComponent {
  @Input({ required: true }) public config!: SummaryTotalConfig;
  @Input({ required: true }) public data!: SummaryTotalData;
}
