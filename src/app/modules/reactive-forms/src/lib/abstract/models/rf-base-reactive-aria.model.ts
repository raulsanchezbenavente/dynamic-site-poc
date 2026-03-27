export interface RfAriaCollection {
  [key: string]: string | RfAriaCollection | undefined;
}

export interface AriaAttributes {
  'aria-activedescendant'?: string;
  'aria-controls'?: string;
  'aria-disabled'?: boolean;
  'aria-expanded'?: boolean;
  'aria-invalid'?: boolean;
  'aria-labelledby'?: string;
}
