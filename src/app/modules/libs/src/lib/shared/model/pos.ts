export interface Pos {
  agent: {
    id: string;
  };
  organization: {
    id: string;
  };

  /**
   * AV properties
   */
  channelType?: number;
  posCode?: string; // TODO: string??
}
