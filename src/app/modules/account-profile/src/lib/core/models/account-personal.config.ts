import { RfListOption } from 'reactive-forms';

export interface AccountPersonalConfig {
  culture: string;
  countryOptions: RfListOption[];
  genderOptions: RfListOption[];
  // ARIA relationship inputs: allows this component's panel to inherit accessibility context from parent and own title.
  parentLabelledById: string;
  ownLabelledById: string;
}
