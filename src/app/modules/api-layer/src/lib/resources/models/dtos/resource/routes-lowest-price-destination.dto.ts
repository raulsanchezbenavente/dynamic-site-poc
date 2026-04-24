import { City } from './city.dto';

export interface RoutesLowestPriceDestination {
  city: City;
  price: Record<string, number>;
  itemText: string;
  itemContent: string;
  cityNodeName: string;
  urlName: object;
  defaultOrder: number;
  categoryCode: string;
  posTags: Array<string>;
  previousPrice: Record<string, number>;
  discount: number;
  secondCurrency: string;
  regions: Array<string>;
}
