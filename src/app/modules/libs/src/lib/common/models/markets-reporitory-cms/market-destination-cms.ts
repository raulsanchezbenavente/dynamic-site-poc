import { StationRepository } from './station-repository';

export interface MarketDestinationCms {
  isEnabled: boolean;
  isDirectFlight: boolean;
  isExternalMarket: boolean;
  station: StationRepository;
}
