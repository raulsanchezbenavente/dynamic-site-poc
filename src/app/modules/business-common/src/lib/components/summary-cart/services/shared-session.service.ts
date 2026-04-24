import { inject, Injectable } from '@angular/core';
import { SeatCode } from '@dcx/ui/business-common';
import {
  Breakdown,
  CurrencyService,
  EnumServiceType,
  EnumStorageKey,
  LoggerService,
  PerPaxJourney,
  PerPaxSegment,
  Pricing,
  Service,
  SessionData,
  SessionStore,
  StorageService,
} from '@dcx/ui/libs';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SharedSessionService {
  private readonly sessionStore = inject(SessionStore);
  private readonly logger = inject(LoggerService);
  private readonly currencyService = inject(CurrencyService);
  private readonly storageService = inject(StorageService);

  public readonly sessionSubject = new BehaviorSubject<SessionData | null>(null);
  public readonly session$: Observable<SessionData> = this.sessionSubject.asObservable() as Observable<SessionData>;

  constructor() {
    this.loadSession();
  }
  /**
   * Updates the behavior subject with the latest session data.
   */
  public updateBooking(): void {
    this.loadSession();
  }

  private loadSession(): void {
    this.sessionStore.getApiSession().subscribe({
      next: (session) => this.sessionSubject.next(structuredClone(session)),
      error: (e) => this.logger.error('SharedSessionService', 'Error initializing session', e),
    });
  }

  private emit(session: SessionData): void {
    const clonedSession = structuredClone(session);
    this.sessionSubject.next(clonedSession);
  }

  public removeService(serviceToRemove: any, saveStorage: boolean = false): void {
    const keys: (keyof Service)[] = ['id', 'paxId', 'sellKey', 'code'];

    const current = this.sessionSubject.value;
    if (!current) return;

    const sessionCopy = structuredClone(current);
    const service: Service = structuredClone(serviceToRemove) as Service;

    let index: number = -1;

    if (service.type === EnumServiceType.SEAT) {
      index = sessionCopy.session.booking.services.findIndex((objeto: Service) => objeto.id === service.id);
    } else {
      index = sessionCopy.session.booking.services.findIndex((objeto: Service) =>
        keys.every((key) => objeto[key] === service[key])
      );
    }
    if (index > -1) {
      sessionCopy.session.booking.services.splice(index, 1);
    }

    this.deleteBreakDownEntry(
      sessionCopy.session.booking.pricing,
      service.sellKey || '',
      service.paxId || '',
      service.code || ''
    );

    this.recomputeTotals(sessionCopy.session.booking.pricing);
    this.emit(sessionCopy);
    if (saveStorage) {
      this.storageService.setSessionStorage(EnumStorageKey.SeatMapBooking, sessionCopy.session.booking);
    }
  }

  public validateServices(serviceToVerify: any): void {
    const services = this.sessionSubject.value?.session.booking.services || [];
    if (
      serviceToVerify[0] &&
      services.some(
        (s) =>
          s.id === serviceToVerify[0].id &&
          s.paxId === serviceToVerify[0].paxId &&
          s.sellKey === serviceToVerify[0].sellKey
      )
    ) {
      this.removeService(serviceToVerify[0]);
    }
  }

  public addService(serviceToAdd: any, saveStorage: boolean = false): void {
    const current = this.sessionSubject.value;
    if (!current) return;
    const sessionCopy = structuredClone(current);

    const journeyId = sessionCopy.session.booking.journeys?.[0]?.id || 'J0';
    const service: Service = {
      ...(structuredClone(serviceToAdd) as Service),
      sellKey: journeyId,
    } as Service;

    sessionCopy.session.booking.services = [...(sessionCopy.session.booking.services || []), service];
    this.updatePricing(sessionCopy, service);
    this.recomputeTotals(sessionCopy.session.booking.pricing);
    this.sessionSubject.next(sessionCopy);
    if (saveStorage) {
      this.storageService.setSessionStorage(EnumStorageKey.SeatMapBooking, sessionCopy.session.booking);
    }
  }

  public addSeatService(serviceToAdd: any): void {
    const current = this.storageService.getSessionStorage(EnumStorageKey.SeatMapBooking);
    const serviceToRemove = current?.services.find(
      (s: any) => s.type === EnumServiceType.SEAT && s.paxId === serviceToAdd.paxId
    );
    if (serviceToRemove) {
      this.removeService(serviceToRemove, true);
    }
    this.addService(serviceToAdd, true);
  }

  private ensurePricing(pricing: Pricing, currency: string): void {
    pricing.breakdown = pricing.breakdown || ({} as Breakdown);
    pricing.breakdown.perBooking = pricing.breakdown.perBooking || [];
    pricing.breakdown.perPax = pricing.breakdown.perPax || [];
    pricing.breakdown.perPaxJourney = pricing.breakdown.perPaxJourney || [];
    pricing.breakdown.perPaxSegment = pricing.breakdown.perPaxSegment || [];
    pricing.breakdown.perSegment = pricing.breakdown.perSegment || [];
    pricing.currency = pricing.currency || currency;
  }
  private deleteBreakDownEntry(pricing: Pricing, journeyId: string, paxId: string, code: string): void {
    if (!pricing?.breakdown?.perPaxJourney) return;
    pricing.breakdown.perPaxJourney = pricing.breakdown.perPaxJourney.filter(
      (entry) => !(entry.journeyId === journeyId && entry.paxId === paxId && entry.charges?.[0]?.code === code)
    );
  }

  private getPricingInfo(sessionData: SessionData, serviceToAdd: Service): { priceAmount: number; priceCode: string } {
    const found = sessionData.session.booking.services.find((d) => d.id === serviceToAdd.id) as {
      price?: number;
      code: string;
    };
    return {
      priceAmount: found?.price ?? 0,
      priceCode: serviceToAdd.code,
    };
  }

  private updatePricing(sessionData: SessionData, serviceToAdd: Service): void {
    const pricing = sessionData.session.booking.pricing;
    if (!pricing) return;
    this.ensurePricing(pricing, this.currencyService.getCurrentCurrency());
    const currency = pricing.currency || 'USD';
    const pricingInfo = this.getPricingInfo(sessionData, serviceToAdd);
    const journeyId = serviceToAdd.sellKey;
    const ppj: PerPaxJourney = {
      paxId: serviceToAdd.paxId,
      journeyId,
      referenceId: serviceToAdd.referenceId,
      totalAmount: pricingInfo.priceAmount,
      currency,
      charges: [
        {
          type: 'Service',
          code: pricingInfo.priceCode,
          amount: pricingInfo.priceAmount * (serviceToAdd.selectedUnits || 1),
          currency,
        },
      ],
    } as PerPaxJourney;
    pricing.breakdown.perPaxJourney.push(ppj);
  }

  public calculateAmountSummaryForPerPaxSegment(serviceCode?: string): number {
    let totalAmount = 0;
    const pricing = this.sessionSubject.value?.session?.booking?.pricing;
    if (pricing?.breakdown?.perPaxSegment) {
      let serviceSegments: PerPaxSegment[] = [];
      if (serviceCode === EnumServiceType.SEAT) {
        const seatCategories = Object.values(SeatCode);
        serviceSegments = pricing.breakdown.perPaxSegment.filter((segment) =>
          seatCategories.includes(segment.charges?.[0]?.code as SeatCode)
        );
      } else {
        serviceSegments = pricing.breakdown.perPaxSegment;
      }
      for (const serviceOfSegment of serviceSegments) {
        totalAmount += serviceOfSegment.totalAmount;
      }
    }
    return totalAmount;
  }
  private recomputeTotals(pricing: Pricing): void {
    if (!pricing) return;
    const sum = (items: Array<{ totalAmount: number }> = []): number =>
      items.reduce((a, b) => a + (b.totalAmount || 0), 0);
    const breakdown = pricing.breakdown;
    const total =
      sum(breakdown.perBooking) +
      sum(breakdown.perPax) +
      sum(breakdown.perPaxJourney) +
      sum(breakdown.perPaxSegment) +
      sum(breakdown.perSegment);
    pricing.totalAmount = total;
    pricing.balanceDue = total;
    pricing.isBalanced = false;
  }
}
