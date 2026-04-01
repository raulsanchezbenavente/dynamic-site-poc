import { City } from './city.dto';
import { RoutesLowestPriceDestination } from './routes-lowest-price-destination.dto';

export interface RouteLowestPrice {
  origin: City;
  destinations: Array<RoutesLowestPriceDestination>;
  cityNodeName: string;
}
