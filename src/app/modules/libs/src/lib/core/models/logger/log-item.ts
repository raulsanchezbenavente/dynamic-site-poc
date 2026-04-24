/**
 * Entity to represent an item related with Logger service
 * IBE+
 */
export interface LogItem {
  type: string;
  className: string;
  message: string;
  detail: any;
}
