import { Deck } from './deck.dto';
import { ServicesSegment } from './services-segment.dto';

export interface ServicesTransport {
  segment: ServicesSegment;
  type: string;
  sufix: string;
  decks: Deck[];
}
