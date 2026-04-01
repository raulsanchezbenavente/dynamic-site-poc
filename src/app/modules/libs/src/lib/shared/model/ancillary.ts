export interface Ancillary {
  code: string;
  description?: string;
  tooltipDescription?: string;
  urlImage?: string;
  status?: string;
  // tslint:disable-next-line: no-any
  sellType?: any[];
  // tslint:disable-next-line: no-any
  selected?: any[];
  // tslint:disable-next-line: no-any
  confirmed?: any[];
  // tslint:disable-next-line: no-any
  fixed?: any[];
  // tslint:disable-next-line: no-any
  availability?: any[];
  // tslint:disable-next-line: no-any
  disabled?: any[];
  isDisabled: boolean;
  priceText?: string;
  buttonText?: string;
  type?: string;
}

export interface AncillaryOwner {
  passengerId?: string;
  referenceId: string;
  description: string;
}

export interface SelectedAncillaryArguments {
  departure?: boolean;
  code: string;
  reference: string;
  passengerId?: string;
}
