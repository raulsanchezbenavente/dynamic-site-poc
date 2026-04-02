import { BannerConfigParams } from './banner-params.config.model';

export interface BannerContainerConfigParams {
  banner: BannerConfigParams;
  rootNodeId: number;
  culture: string;
  componentOrder: number;
}
