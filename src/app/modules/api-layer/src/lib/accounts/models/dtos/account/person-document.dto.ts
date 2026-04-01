import { PersonDocumentType } from '../enums/person-document-type.enum';

export interface PersonDocumentDto {
  type: PersonDocumentType;
  number: string;
  issuedCountry: string;
  nationality: string;
  expirationDate: Date;
  issuedDate: Date;
  isDefault: boolean;
}
