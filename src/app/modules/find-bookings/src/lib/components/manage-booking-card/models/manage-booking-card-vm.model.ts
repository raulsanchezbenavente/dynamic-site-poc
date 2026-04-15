import { JourneyVM } from '@dcx/ui/libs';

export interface ManageBookingCardVM {
  journeyVM: JourneyVM;
  checkInDeepLinkUrl: string;
  isCheckInAvailable: boolean;
  mmbDeepLinkUrl: string;
  isMmbAvailable: boolean;
  pageNumber?: number;
  totalRecords?: number;
}
