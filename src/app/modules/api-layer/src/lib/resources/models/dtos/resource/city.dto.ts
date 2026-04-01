import { Category } from './category.dto';
import { ImageModel } from './image-model.dto';
import { MediaDataModel } from './media-data-model.dto';

export interface City {
  countryCode: string;
  countryName: string;
  isDefault: boolean;
  isMac: boolean;
  picture: ImageModel;
  title: string;
  introduction: string;
  description: string;
  headerImgModel: ImageModel;
  quickFactImgSrc: ImageModel;
  categories: Array<Category>;
  bannerImgSrc: MediaDataModel;
}
