import { Alert } from '../alert';
import { BannerItemModel } from '../banner-item-model';
import { Country } from '../country';
import { EntranceDocuments } from '../entrance-documents';
import { Market } from '../market';
import { Station } from '../station';
import { TravelDocuments } from '../travel-documents';
import { ValidDocuments } from '../valid-documents';

export class Resources {
  stations?: Station[];
  markets?: Market[];
  countries?: Country[];
  documents?: ValidDocuments[];
  travelDocuments?: TravelDocuments[];
  entranceDocuments?: EntranceDocuments[];
  banners?: BannerItemModel[];
  alerts?: Alert[];
}
