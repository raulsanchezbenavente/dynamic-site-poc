export interface SummaryBuilderAddition {
  label: (raw: any) => string;
  value: (raw: any) => string;
  position?: {
    key: string;
    after?: boolean;
  };
}
export type SummaryBuilderAdditions = Record<string, SummaryBuilderAddition>;
