export type GridBuilderColspan = { keys: string[]; colSpan?: 'colspan2' | 'colspan3' | 'full'; cssClass?: string };

export type GridBuilderCustomType = Record<string, GridBuilderColspan>;
