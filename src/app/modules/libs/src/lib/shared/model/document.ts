export interface Document {
  type?: string;
  number?: string;
  issuedCountry?: string;
  nationality?: string;
  expirationDate?: string;
  issuedDate?: string;

  /**
   * AV properties
   */
  isDefault?: boolean;
}
