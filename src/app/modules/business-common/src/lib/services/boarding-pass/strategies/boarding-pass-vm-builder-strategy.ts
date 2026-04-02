import { inject, Injectable } from '@angular/core';
import { Booking, Journey, Pax, PaxSegmentInfo, Segment, Transport } from '@dcx/ui/api-layer';
import { CultureServiceEx, EnumSeparators, EnumStorageKey, StorageService, TextHelperService } from '@dcx/ui/libs';
import { TranslateService } from '@ngx-translate/core';
import dayjs from 'dayjs';

import { BoardingPassVMBuilderData, IBoardingPassVMBuilder } from '..';
import { BoardingPassSegmentVM, BoardingPassVM } from '../../../components/boarding-pass/boarding-pass-preview';

@Injectable({ providedIn: 'root' })
export class BoardingPassVMBuilderService implements IBoardingPassVMBuilder {
  private readonly storageService = inject(StorageService);
  private readonly translate = inject(TranslateService);
  private readonly cultureServiceEx = inject(CultureServiceEx);
  private readonly textHelperService = inject(TextHelperService);

  public getBoardingPassVM(data: BoardingPassVMBuilderData): BoardingPassVM {
    const booking = this.storageService.getSessionStorage(EnumStorageKey.SessionBooking) as Booking;

    if (!booking) {
      return this.getEmptyBoardingPassVM();
    }

    const passenger = this.findPassenger(booking, data.paxId);
    const journey = this.findJourney(booking, data.journeyId);

    if (!passenger || !journey) {
      return this.getEmptyBoardingPassVM();
    }

    return {
      paxId: passenger.id,
      passengerName: this.getPassengerFullName(passenger),
      segments: this.buildSegments(journey, passenger.id, booking),
    };
  }

  private findPassenger(booking: Booking, paxId: string): Pax | undefined {
    return booking.pax?.find((p) => p.id === paxId);
  }

  private findJourney(booking: Booking, journeyId: string): Journey | undefined {
    return booking.journeys?.find((j) => j.id === journeyId);
  }

  private getPassengerFullName(passenger: Pax): string {
    const firstName = passenger.name?.first || '';
    const lastName = passenger.name?.last || '';
    const fullName = `${firstName} ${lastName}`.trim();
    return this.textHelperService.getCapitalizeWords(fullName) || EnumSeparators.DASH;
  }

  private buildSegments(journey: Journey, paxId: string, booking: Booking): BoardingPassSegmentVM[] {
    if (!journey.segments || journey.segments.length === 0) {
      return [];
    }

    return journey.segments.map((segment: Segment) => this.buildSegment(journey.id, segment, paxId, booking));
  }

  private buildSegment(journeyId: string, segment: Segment, paxId: string, booking: Booking): BoardingPassSegmentVM {
    const passengerInfo = this.findPassengerSegmentInfo(booking, paxId, segment.id);

    return {
      id: segment.id || EnumSeparators.DASH,
      journeyId: journeyId,
      origin: this.translate.instant('City.' + segment.origin),
      destination: this.translate.instant('City.' + segment.destination),
      originCode: segment.origin || EnumSeparators.DASH,
      destinationCode: segment.destination || EnumSeparators.DASH,
      departureTime: this.formatDepartureTime(segment.std),
      departureDate: {
        date: dayjs(segment.std),
        format: 'ddd, MMM DD',
      },
      gate: EnumSeparators.DASH,
      seat: passengerInfo?.seat || EnumSeparators.DASH,
      flightNumber: this.getFlightNumber(segment.transport),
    };
  }

  private findPassengerSegmentInfo(booking: Booking, paxId: string, segmentId: string): PaxSegmentInfo | undefined {
    const passenger = booking.pax?.find((p) => p.id === paxId);
    return passenger?.segmentsInfo?.find((si) => si.segmentId === segmentId);
  }

  private formatDepartureTime(dateTime?: Date | string): string {
    if (!dateTime || dateTime === '0001-01-01T00:00:00') return '-';

    try {
      return dayjs(dateTime).format(this.cultureServiceEx.getUserCulture().timeFormat);
    } catch {
      return EnumSeparators.DASH;
    }
  }

  private getFlightNumber(transport?: Transport): string {
    const carrier = transport?.carrier?.code || '';
    const flightNumber = transport?.number || '';

    if (carrier && flightNumber) {
      return `${carrier} ${flightNumber}`;
    }

    return flightNumber || EnumSeparators.DASH;
  }

  private getEmptyBoardingPassVM(): BoardingPassVM {
    return {
      paxId: '',
      passengerName: EnumSeparators.DASH,
      segments: [],
    };
  }
}
