import { Component, Input } from '@angular/core';

import { PnrConfig } from './models/pnr-config.model';

/**
 * Displays the PNR (booking reference) and a label
 */
@Component({
  selector: 'pnr',
  templateUrl: './pnr.component.html',
  styleUrls: ['./styles/pnr.styles.scss'],
  imports: [],
    standalone: true
})
export class PnrComponent {
  @Input() public config!: PnrConfig;
}
