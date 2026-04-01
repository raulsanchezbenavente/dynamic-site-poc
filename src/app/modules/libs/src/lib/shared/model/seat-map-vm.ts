import { GetSeatMapResponse } from './../api-models/get-seat-map-response';

export interface SeatMapVM {
  segmentId: string;
  seatMap: GetSeatMapResponse;
}
