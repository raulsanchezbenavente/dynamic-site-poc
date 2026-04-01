import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ConfigService, HttpClientService, IdleTimeoutService, ProductApi } from '@dcx/ui/libs';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Booking, ChangeBookingModel, CreateBookingInSessionCommand, CreateBookingInSessionDto } from '..';
import { CommandResponse, QueryResponse, VoidCommandResponse } from '../../CQRS';

import { BookingSessionMockService } from './booking-session-mock.service';

@Injectable({
  providedIn: 'root',
})
export class BookingSessionService extends HttpClientService {
  private readonly bookingSessionMockService = inject(BookingSessionMockService);

  constructor(httpClient: HttpClient, idleTimeoutService: IdleTimeoutService, configService: ConfigService) {
    super(httpClient, idleTimeoutService, configService);
  }

  public getBooking(): Observable<QueryResponse<Booking>> {
    return this.get<object, QueryResponse<Booking>>(ProductApi.BOOKING, 'booking/session').pipe(
      map((response: QueryResponse<Booking>) => {
        if (!response.result?.data) {
          return response;
        }

        const booking = response.result.data;

        // Generate mock booking data if applicable
        const mockData = this.bookingSessionMockService.generateMockBookingData(booking);

        // If no mock data, return original booking
        if (!mockData) {
          return response;
        }

        // Add mock services and updated pricing to response
        return {
          ...response,
          result: {
            ...response.result,
            data: {
              ...booking,
              services: [...booking.services, ...mockData.services],
              pricing: mockData.pricing,
            },
          },
        };
      })
    );
  }

  public reloadBooking(): Observable<CommandResponse<VoidCommandResponse>> {
    return this.put(ProductApi.BOOKING, 'booking/session');
  }

  public clearBooking(): Observable<CommandResponse<VoidCommandResponse>> {
    return this.delete(ProductApi.BOOKING, 'booking/session');
  }

  public createBookingInSession(
    command: CreateBookingInSessionCommand
  ): Observable<CommandResponse<CreateBookingInSessionDto>> {
    return this.post(ProductApi.BOOKING, '/booking/create', command);
  }

  public getChangeBooking(): Observable<QueryResponse<ChangeBookingModel>> {
    return this.get(ProductApi.BOOKING, 'booking/changes');
  }
}
