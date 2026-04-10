import { Component, Input } from '@angular/core';
import { LanguageSelectorComponent } from '@dcx/storybook/design-system';
import { PointsOfSaleComponent } from '@dcx/ui/business-common';

import { SecondaryNavLinkComponent } from './components/secondary-nav-link/secondary-nav-link.component';
import { SecondaryNavComponents } from './enums/secondary-nav-components.enum';
import { SecondaryNav } from './models/secondary-nav.model';

/**
 * This component need a refactor on its languages and currencies models
 */
@Component({
  selector: 'secondary-nav',
  templateUrl: './secondary-nav.component.html',
  styleUrls: ['./styles/secondary-nav.styles.scss'],
  host: {
    class: 'secondary-nav',
  },
  imports: [SecondaryNavLinkComponent, LanguageSelectorComponent, PointsOfSaleComponent],
  standalone: true,
})
export class SecondaryNavComponent {
  @Input() public secondaryNavOptions!: SecondaryNav;
  @Input() public isResponsive!: boolean;
  public secondaryNavComponents = SecondaryNavComponents;
}
