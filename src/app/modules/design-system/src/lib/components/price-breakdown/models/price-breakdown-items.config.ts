export interface PriceBreakdownItemsVM {
  item: PriceBreakdownItemVM;
  subitems: PriceBreakdownItemVM[];
}

export interface PriceBreakdownItemVM {
  quantity: number;
  code: string;
  price: number;
  currency: string;
}
