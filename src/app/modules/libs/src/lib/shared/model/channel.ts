export interface Channel {
  type?: string;
  info?: string;
  prefix?: string;
  cultureCode?: string;

  /**
   * AV properties
   */
  scope?: number;
  additionalData?: string; // TODO: string?
}
