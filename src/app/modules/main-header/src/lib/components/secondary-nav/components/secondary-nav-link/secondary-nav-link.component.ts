import { Component, Input } from '@angular/core';
import { AccessibleLinkDirective } from '@dcx/ui/libs';

import { SecondaryNavLinkConfig } from '../../models/secondary-nav-link.config';
import { IconComponent } from '@dcx/storybook/design-system';

@Component({
  selector: 'secondary-nav-link',
  templateUrl: './secondary-nav-link.component.html',
  styleUrls: ['./styles/secondary-nav-link.styles.scss'],
  host: { class: 'secondary-nav-link' },
  imports: [IconComponent, AccessibleLinkDirective],
  standalone: true,
})
export class SecondaryNavLinkComponent {
  @Input({ required: true }) public config!: SecondaryNavLinkConfig;
}
