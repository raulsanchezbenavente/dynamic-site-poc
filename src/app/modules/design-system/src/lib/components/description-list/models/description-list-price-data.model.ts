import { DescriptionListItemData } from './description-list-data.model';

export interface DescriptionListPriceData extends DescriptionListItemData {
  currency: string;
  price: number;
}
