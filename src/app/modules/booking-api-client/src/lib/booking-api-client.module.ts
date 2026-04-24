import { NgModule } from '@angular/core';

import {
  BoardingPassClient,
  BookingClient,
  ChangeJourneyClient,
  ChangesClient,
  CheckinLoginClient,
  CheckStatusClient,
  CommentClient,
  DisruptedBookingClient,
  DuplicateBookingClient,
  EticketsClient,
  FindBookingsClient,
} from './booking-api';
@NgModule({
  providers: [
    BoardingPassClient,
    BookingClient,
    ChangeJourneyClient,
    ChangesClient,
    CheckinLoginClient,
    CheckStatusClient,
    CommentClient,
    DisruptedBookingClient,
    DuplicateBookingClient,
    EticketsClient,
    FindBookingsClient,
  ],
})
export class BookingApiClientModule {}
