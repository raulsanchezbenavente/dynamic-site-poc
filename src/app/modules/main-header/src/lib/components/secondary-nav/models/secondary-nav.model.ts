import { SecondaryNavComponents } from '../enums/secondary-nav-components.enum';

import { SecondaryNavOptionConfig } from './secondary-nav.config';

export interface SecondaryNav {
  availableComponents: SecondaryNavComponents[];
  config: SecondaryNavOptionConfig;
}
