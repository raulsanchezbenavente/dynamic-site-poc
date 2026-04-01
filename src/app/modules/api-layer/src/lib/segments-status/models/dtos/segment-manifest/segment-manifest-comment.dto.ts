import { SegmentManifestCommentType } from '../enums/segment-manifest-comment-type.enum';

export interface SegmentManifestCommentDto {
  type: SegmentManifestCommentType;
  data: string;
}
