import { Component, Input } from '@angular/core';

import { BadgeConfig } from './models/badge.config';
import { IconComponent } from "../icon/icon.component";

@Component({
  selector: 'badge',
  templateUrl: './badge.component.html',
  styleUrls: ['./styles/badge.styles.scss'],
  host: {
    class: 'ds-badge',
  },
    imports: [IconComponent],
    standalone: true
})
export class BadgeComponent {
  @Input() public config!: BadgeConfig;
}
