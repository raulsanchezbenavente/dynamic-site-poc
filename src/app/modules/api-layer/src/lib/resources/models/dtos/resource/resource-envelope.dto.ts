export interface ResourceEnvelope<T> {
  resourceType: string;
  culture: string;
  data: T[];
  metadata: {
    count: number;
    generatedAt: string;
  };
}

export interface ResourceQuery {
  culture: string;
  [key: string]: string | number | boolean | undefined;
}
