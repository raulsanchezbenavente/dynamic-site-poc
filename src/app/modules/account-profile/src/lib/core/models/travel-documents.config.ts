import { RfListOption } from 'reactive-forms';

export interface TravelDocumentsConfig {
  culture: string;
  documentOptions: RfListOption[];
  countryOptions: RfListOption[];
  documentsFormConfig: {
    title: string;
    description: string;
  };
}
