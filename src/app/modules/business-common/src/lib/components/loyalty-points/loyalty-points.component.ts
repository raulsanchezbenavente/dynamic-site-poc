import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { LoyaltyPoints } from './models/loyalty-points.model';
import { TranslationKeys } from './enums/translation-keys.enum';

@Component({
  selector: 'loyalty-points',
  templateUrl: './loyalty-points.component.html',
  styleUrls: ['./styles/loyalty-points.styles.scss'],
  encapsulation: ViewEncapsulation.None,
  imports: [TranslateModule],
  standalone: true,
})
export class LoyaltyPointsComponent implements OnInit {
  @Input({ required: true }) public loyaltyPointsModel!: LoyaltyPoints;

  public ngOnInit(): void {
    this.internalInit();
  }

  protected internalInit(): void {
    this.loyaltyPointsModel.label ??= TranslationKeys.Loyalty_PointsUnit_Text;
  }
}
