import { LinkModel } from './link.model';
import { MediaModel } from './media-model';

export interface BannerItemModel {
  bg: MediaModel;
  bgM: MediaModel;
  bgL: MediaModel;
  title: string;
  subtitle: string;
  station?: string;
  text: string;
  button: LinkModel;
  textAlign: string;
  textLight: boolean;
  fullImageLink: boolean;
}
