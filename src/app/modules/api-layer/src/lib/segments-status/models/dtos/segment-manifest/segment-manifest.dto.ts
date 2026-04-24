import { SegmentManifestPaxDto } from './segment-manifest-pax.dto';

export interface SegmentManifestDto {
  sold: number;
  standBy: number;
  checkInLid: number;
  pax: SegmentManifestPaxDto[];
}
