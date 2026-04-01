import { Pax } from '../../..';

export interface UpdatePaxDto extends Pax {
  isLoggedInUser: boolean;
}
