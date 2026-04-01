/**
 * Entity to represent an event related with Composer service
 * IBE+
 */
export interface ComposerEvent {
  componentId: string;
  status: string;
  type: string;
  priority?: number;
}
