import { VideoSourceOption } from '@dcx/ui/libs';

import { ImageMediaConfig } from './image-media.config.model';
import { UploadVideoMediaConfig } from './upload-video-media.config.model';

export interface VideoMediaConfig {
  sourceOption: VideoSourceOption;
  text: string;
  upload: UploadVideoMediaConfig;
  fallbackImage: ImageMediaConfig;
}
