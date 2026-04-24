import { LoginOptionType } from '@dcx/ui/libs';

export interface LoginBookingRequest {
  recordLocator: string;
  paxSurname?: string;
  contactEmail?: string;
  loginOptionType?: LoginOptionType;
}
