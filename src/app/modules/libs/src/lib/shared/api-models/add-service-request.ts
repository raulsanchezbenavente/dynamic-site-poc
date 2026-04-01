export interface AddServiceRequest {
  services: ServiceItemRequest[];
}

export interface ServiceItemRequest {
  serviceId?: string;
  serviceSellKey?: string;
  code?: string;
  type?: string;
  paxId?: string;
  sellKey?: string;
}
