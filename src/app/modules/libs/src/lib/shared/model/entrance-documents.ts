import { DocumentConfiguration } from './document-configuration';
import { TravelDocumentRequestedOn } from './travel-document-request-on';

export interface EntranceDocuments {
  visaIssuers?: string[];
  origin?: string;
  nationality: string;
  destination?: string;
  strategy?: number;
  requestedOn?: TravelDocumentRequestedOn[];
  documentsConfiguration: DocumentConfiguration[];
}
