import { VideoOption } from '../enums/video-option.enum';

import { ImageMediaDataModel } from './image-media-data-model.dto';
import { UploadVideoMediaModel } from './upload-video-media-model.dto';

export interface VideoMediaDataModel {
  option: VideoOption;
  text: string;
  upload: UploadVideoMediaModel;
  fallbackImage: ImageMediaDataModel;
}
