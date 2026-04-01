import { SegmentDocument } from './segment-document.dto';
import { StrategyByFlow } from './strategy-by-flow.dto';

export interface BaseSegmentDocuments {
  nationality: string;
  origin: string;
  destination: string;
  requestedOn: Array<StrategyByFlow>;
  documentsConfiguration: Array<SegmentDocument>;
}
