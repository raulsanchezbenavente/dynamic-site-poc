import { ImageMediaDataModel } from './image-media-data-model.dto';
import { VideoMediaDataModel } from './video-media-data-model.dto';

export interface MediaDataModel {
  imageMedia: ImageMediaDataModel;
  videoMedia: VideoMediaDataModel;
}
