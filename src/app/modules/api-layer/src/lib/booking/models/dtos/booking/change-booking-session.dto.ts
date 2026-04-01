export interface SeatItem {
  id: string;
  referenceId: string;
  code: string;
  sellKey: string;
  paxId: string;
  status: string;
  changeStrategy: string;
  type: string;
  scope: string;
  note: string | null;
  category: string;
  source: string | null;
  isChecked: boolean;
  differentialId: string;
  expirationDate: string;
  included: null;
  restrictions: null;
}

export interface ModifiedItem {
  newItem: SeatItem;
  oldItem: SeatItem;
}

export interface ChangeBookingModel {
  services: { added: SeatItem[]; modified: ModifiedItem[]; deleted: SeatItem[] };
}
