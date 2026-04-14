import { RfListOption } from 'reactive-forms';

export interface MyProfileConfig {
  culture: string;
  countryOptions: RfListOption[];
  genderOptions: RfListOption[];
  countryPrefixOptions: RfListOption[];
  personalFormConfig: {
    title: string;
    description: string;
  };

  hideEditDocumentsSection?: boolean;
}
