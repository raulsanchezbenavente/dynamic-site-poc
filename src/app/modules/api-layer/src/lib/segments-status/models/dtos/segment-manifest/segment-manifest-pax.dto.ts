import { SegmentsStatusGenderType } from '../enums/segments-status-gender-type.enum';
import { SegmentsStatusPaxCategoryType } from '../enums/segments-status-pax-category-type.enum';
import { SegmentManifestPaxStatus } from '../enums/segment-manifest-pax-status.enum';
import { SegmentsStatusPersonDocument } from '../person/segments-status-person-document.dto';
import { SegmentsStatusPersonInfo } from '../person/segments-status-person-info.dto';
import { SegmentsStatusPersonName } from '../person/segments-status-person-name.dto';

import { SegmentManifestCommentDto } from './segment-manifest-comment.dto';
import { SegmentManifestServiceDto } from './segment-manifest-service.dto';

export interface SegmentManifestPaxDto {
  name: SegmentsStatusPersonName;
  gender: SegmentsStatusGenderType;
  status: SegmentManifestPaxStatus;
  paxCategory: SegmentsStatusPaxCategoryType;
  seats: string[];
  hasInfant: boolean;
  services: SegmentManifestServiceDto[];
  personInfo: SegmentsStatusPersonInfo;
  segmentStatus: string;
  priorityCode: string;
  priorityDate: Date;
  comments: SegmentManifestCommentDto[];
  documents: SegmentsStatusPersonDocument[];
}
