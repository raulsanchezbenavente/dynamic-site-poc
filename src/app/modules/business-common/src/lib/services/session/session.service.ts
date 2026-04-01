import { inject, Injectable } from '@angular/core';
import {
  Booking,
  BookingSessionService,
  ChangeBookingModel,
  CommandResponse,
  QueryResponse,
  VoidCommandResponse,
} from '@dcx/ui/api-layer';
import { EnumStorageKey, StorageService } from '@dcx/ui/libs';
import { Observable, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SessionService {
  private readonly bookingSessionService = inject(BookingSessionService);
  private readonly storageService = inject(StorageService);

  public getSessionBooking(): Observable<QueryResponse<Booking>> {
    return this.bookingSessionService.getBooking().pipe(
      tap({
        next: (bookingResponse) => {
          const booking = bookingResponse.result.data;
          this.saveSessionBooking(booking);
        },
        error: (error) => {
          console.error('Error fetching booking session:', error);
        },
      })
    );
  }

  public getChangesbooking(): Observable<QueryResponse<ChangeBookingModel>> {
    return this.bookingSessionService.getChangeBooking();
  }

  public reloadBookingSession(): Observable<CommandResponse<VoidCommandResponse>> {
    return this.bookingSessionService.reloadBooking().pipe(
      tap({
        next: () => {},
        error: (error) => {
          console.error('Error fetching booking session:', error);
        },
      })
    );
  }

  public getBookingFromStorage(): Booking | null {
    const booking = this.storageService.getSessionStorage(EnumStorageKey.SessionBooking);
    return booking ?? null;
  }

  private saveSessionBooking(booking: Booking): void {
    this.storageService.setSessionStorage(EnumStorageKey.SessionBooking, booking);
  }
}
