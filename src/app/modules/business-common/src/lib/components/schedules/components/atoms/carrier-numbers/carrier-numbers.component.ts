import { Component, Input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { CarrierNumbers } from './models/carrier-numbers.model';

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
  @Input({ required: true }) public data!: CarrierNumbers[];
}
