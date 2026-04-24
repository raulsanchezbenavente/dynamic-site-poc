export interface LinkModel {
  url: string;
  title?: string;
  target?: LinkTarget | null;
}

export enum LinkTarget {
  BLANK = '_blank',
  PARENT = '_parent',
}
