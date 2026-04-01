import { RetrieveSegmentRequestType } from '../dtos/enums/retrieve-segment-request-type.enum';

export interface RetrieveSegmentRequestDto {
  origin: string;
  destination: string;
  departureDate: Date;
  transportCarrierCode: string;
  transportNumber: string;
  type?: RetrieveSegmentRequestType;
}
