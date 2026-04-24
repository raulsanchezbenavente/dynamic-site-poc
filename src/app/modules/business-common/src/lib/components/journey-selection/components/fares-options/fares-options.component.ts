import { Component, Input } from '@angular/core';

import { FareOptionsItemComponent } from '../fare-options-item/fare-options-item.component';

import { FareOptions } from './models/fare-options.model';

@Component({
  selector: 'fares-options',
  templateUrl: './fares-options.component.html',
  styleUrls: ['./styles/fares-options.styles.scss'],
  host: {
    class: 'fares-options',
  },
  imports: [FareOptionsItemComponent],
  standalone: true,
})
export class FaresOptionsComponent {
  @Input({ required: true }) public data!: FareOptions;
}
