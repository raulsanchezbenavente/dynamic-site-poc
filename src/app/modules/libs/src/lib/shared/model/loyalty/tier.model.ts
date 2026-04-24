import { Image } from '../image';

export interface Tier {
  name: string;
  order: number;
  logo?: Image;
}
