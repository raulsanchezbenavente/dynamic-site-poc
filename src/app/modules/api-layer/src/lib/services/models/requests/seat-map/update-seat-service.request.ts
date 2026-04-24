export interface UpdateSeatServiceRequest {
  category: string;
  code: string;
  compartmentDesignator: string;
  isExitRow: boolean;
  paxId: string;
  referenceId: string;
  seat: string;
  sellKey: string;
  serviceId: string;
  serviceSellKey: string;
  type: string;
}
