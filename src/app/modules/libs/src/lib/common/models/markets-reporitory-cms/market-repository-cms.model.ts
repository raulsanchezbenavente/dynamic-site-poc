import { MarketDestinationCms } from './market-destination-cms';
import { StationRepository } from './station-repository';

export interface MarketRepositoryCmsModel {
  origin: StationRepository;
  destinations: MarketDestinationCms[];
}
