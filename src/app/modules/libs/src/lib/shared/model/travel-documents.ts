import { DocumentConfiguration } from './document-configuration';
import { TravelDocumentRequestedOn } from './travel-document-request-on';

export interface TravelDocuments {
  nationality: string;
  destination?: string;
  strategy?: number;
  requestedOn?: TravelDocumentRequestedOn[];
  documentsConfiguration: DocumentConfiguration[];
}
