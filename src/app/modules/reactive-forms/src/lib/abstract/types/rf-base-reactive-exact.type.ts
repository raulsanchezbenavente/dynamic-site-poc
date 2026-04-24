export type Exact<T, U extends T> = U extends T
  ? { [K in keyof U]: U[K] } & Record<Exclude<keyof U, keyof T>, never>
  : never;

export type Strict<T> = T & { [K in keyof T]: T[K] };
