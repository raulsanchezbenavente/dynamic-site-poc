import { Component, Input } from '@angular/core';

import { IconComponent } from '../icon/icon.component';

import { DataNotFoundConfig } from './models/data-not-found-config.model';

@Component({
  selector: 'data-not-found',
  templateUrl: './data-not-found.component.html',
  styleUrls: ['./styles/data-not-found.styles.scss'],
  host: { class: 'ds-data-not-found' },
  imports: [IconComponent],
  standalone: true,
})
export class DataNotFoundComponent {
  @Input() public config!: DataNotFoundConfig;
}
