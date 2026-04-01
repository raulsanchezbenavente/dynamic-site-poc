import { Query } from '../../../CQRS';
import { RetrieveSegmentRequestType } from '../dtos/enums/retrieve-segment-request-type.enum';

export interface RetrieveSegmentManifestQuery extends Query {
  request: RetrieveSegmentRequestType;
}
