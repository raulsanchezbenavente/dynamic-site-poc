export interface Country {
  name: string;
  code: string;
  currencyCode: string;
  phonePrefix: string;
  order: string;
  languages: Record<string, string>;
}
