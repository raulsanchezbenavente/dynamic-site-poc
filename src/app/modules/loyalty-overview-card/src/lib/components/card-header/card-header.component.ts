import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'loyalty-overview-card-header',
  templateUrl: './card-header.component.html',
  styleUrls: ['./styles/card-header.styles.scss'],
  imports: [TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class LoyaltyOverviewCardHeaderComponent {
  public greeting = input.required<string>();
  public tierName = input.required<string>();
}
