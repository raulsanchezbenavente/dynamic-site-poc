import { DictionaryType } from './dictionary-type';
import { OptionsList } from './options-list/options-list.model';

export interface Country extends OptionsList {
  phonePrefix?: string;
  languages?: DictionaryType;
  codeHide?: string;
  currencyCode?: string;
}
