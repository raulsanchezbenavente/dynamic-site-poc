import { RfListOption } from 'reactive-forms';

export interface AccountCompanionsConfig {
  culture: string;
  countryOptions: RfListOption[];
  genderOptions: RfListOption[];
  companionsFormConfig: {
    title: string;
    description: string;
  };
  hideContainerAddButton: boolean;
  hideEditButton: boolean;
}
