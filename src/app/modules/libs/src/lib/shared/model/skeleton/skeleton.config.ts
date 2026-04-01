import { EnumAnimationSkeleton, EnumAppearenceSkeleton } from '../../enums';

export interface SkeletonConfig {
  animation?: EnumAnimationSkeleton;
  appearance?: EnumAppearenceSkeleton;
  count?: number;
}
