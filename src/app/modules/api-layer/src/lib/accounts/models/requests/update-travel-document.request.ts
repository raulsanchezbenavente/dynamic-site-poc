import { PersonDocumentDto } from '../dtos/account/person-document.dto';

export interface UpdateTravelDocumentsRequest {
  travelDocuments: PersonDocumentDto[];
  requestType: string;
  id: string;
}
