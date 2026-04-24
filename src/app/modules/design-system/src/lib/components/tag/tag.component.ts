import { Component, Input, ViewEncapsulation } from '@angular/core';

import { TagConfig } from './models/tag.config';

@Component({
  selector: 'tag',
  templateUrl: './tag.component.html',
  styleUrls: ['./styles/tag.styles.scss'],
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class]': "'ds-tag' + (config?.cssClass ? ' ds-tag--' + config.cssClass : '')",
  },
  standalone: true,
})
export class TagComponent {
  @Input() public config!: TagConfig;
}
