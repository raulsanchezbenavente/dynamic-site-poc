import { RfListOption } from 'reactive-forms';

export interface AccountContactConfig {
  culture: string;
  countryPrefixOptions: RfListOption[];
  parentLabelledById: string;
  ownLabelledById: string;
  hideEditDocumentsSection?: boolean;
}
