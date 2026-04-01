export interface SegmentsStatusPersonDocument {
  type: DocumentType;
  number: string;
  issuedCountry: string;
  nationality: string;
  expirationDate: Date;
  issuedDate: Date;
  isDefault: boolean;
}
