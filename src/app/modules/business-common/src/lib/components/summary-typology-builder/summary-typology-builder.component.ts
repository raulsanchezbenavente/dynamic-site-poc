import { Component, Input, ViewEncapsulation } from '@angular/core';
import { SummaryTypologyBuilderConfig, SummaryTypologyTemplate } from '@dcx/ui/libs';
import { SummaryTypologyPerBookingComponent } from './components/summary-typology-per-booking/summary-typology-per-booking.component';
import { SummaryTypologyPerJourneyComponent } from './components/summary-typology-per-journey/summary-typology-per-journey.component';

@Component({
  selector: 'summary-typology-builder',
  templateUrl: './summary-typology-builder.component.html',
  styleUrls: ['./styles/summary-typology.style.scss'],
  encapsulation: ViewEncapsulation.None,
  imports: [SummaryTypologyPerBookingComponent, SummaryTypologyPerJourneyComponent],
  standalone: true,
})
export class SummaryTypologyBuilderComponent {
  @Input() public summaryTypologyConfig!: SummaryTypologyBuilderConfig;
  public summaryTypologyTemplate = SummaryTypologyTemplate;
}
