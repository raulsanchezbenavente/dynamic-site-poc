import { Component, Input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { CarrierNumbers } from './models/carrier-numbers.model';
import { CommonTranslationKeys } from '@dcx/ui/libs';

@Component({
  selector: 'carrier-numbers',
  templateUrl: './carrier-numbers.component.html',
  styleUrls: ['./styles/carrier-numbers.styles.scss'],
  host: {
    class: 'carrier-numbers',
  },
  imports: [TranslateModule],
  standalone: true,
})
export class CarrierNumbersComponent {
  protected readonly commonTranslationKeys = CommonTranslationKeys;

  @Input({ required: true }) public data!: CarrierNumbers[];
}
