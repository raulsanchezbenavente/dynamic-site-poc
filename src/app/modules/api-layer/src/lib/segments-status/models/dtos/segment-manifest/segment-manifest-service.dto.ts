import { SegmentsStatusServiceType } from '../enums/segments-status-service-type.enum';

export interface SegmentManifestServiceDto {
  type: SegmentsStatusServiceType;
  code: string;
  quantity: number;
}
