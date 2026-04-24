export interface SummaryDocumentsData {
  document_type: string;
  number: string;
  document_nationality: string;
  expiration_date: {
    day: string;
    month: string;
    year: string;
  };
}
