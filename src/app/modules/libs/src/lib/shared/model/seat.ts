export interface Seat {
  id: string;
  segmentId: string;
  passengerId: string;
  seatNumber?: string;
  seatNumberOriginal?: string;
  row?: number;
  column?: string;
  code?: string;
  allowRemove?: boolean;
  isExitRow?: boolean;
  isOnlyAvailableForExtraSeat?: boolean;
  compartmentDesignator: string;
  category?: string;
}
