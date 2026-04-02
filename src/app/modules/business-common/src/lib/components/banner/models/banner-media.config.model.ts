import { ImageMediaConfig } from './image-media.config.model';
import { VideoMediaConfig } from './video-media.config.model';

export interface BannerMediaConfig {
  imageMedia?: ImageMediaConfig;
  videoMedia?: VideoMediaConfig;
}
