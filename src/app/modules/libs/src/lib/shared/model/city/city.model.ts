import { Location } from '../destinations/location';
import { Image } from '../image';

import { CityCategory } from './city-category.model';

export interface CityModel extends Location {
  countryName: string;
  isDefault: boolean;
  isMac: boolean;
  picture: Image;
  title: string;
  introduction: string;
  description: string;
  headerImgModel: Image;
  quickFactImgSrc: Image;
  categories?: CityCategory[];
}
