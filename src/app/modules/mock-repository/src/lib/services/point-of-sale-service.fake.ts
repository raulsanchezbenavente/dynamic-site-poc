import type { PointOfSale, PointOfSaleVm } from '@dcx/ui/libs';
import { BehaviorSubject, Observable } from 'rxjs';

export class PosServiceFake {
  private static createPos(pos: Partial<PointOfSale>): PointOfSale {
    return {
      default: false,
      isForRestOfCountries: false,
      flagImageCode: pos.code ?? '',
      countryCode: pos.code ?? '',
      ...pos,
    } as PointOfSale;
  }

  public pointsOfSaleList: PointOfSale[] = [
    PosServiceFake.createPos({
      code: 'US',
      stationCode: 'NYC',
      currency: { code: 'USD', name: 'US Dollar', symbol: '$' },
      name: 'United States',
      default: true,
    }),
    PosServiceFake.createPos({
      code: 'CO',
      stationCode: 'BOG',
      currency: { code: 'COP', name: 'Colombian Peso', symbol: '$' },
      name: 'Colombia',
    }),
    PosServiceFake.createPos({
      code: 'ES',
      stationCode: 'MAD',
      currency: { code: 'EUR', name: 'Euro', symbol: '€' },
      name: 'Spain',
    }),
    PosServiceFake.createPos({
      code: 'BR',
      stationCode: 'SAO',
      currency: { code: 'BRL', name: 'Brazilian Real', symbol: 'R$' },
      name: 'Brazil',
    }),
  ];
  private current: PointOfSale | null = null;
  private readonly subject = new BehaviorSubject<PointOfSale | null>(null);
  public readonly pointOfSale$: Observable<PointOfSale | null> = this.subject.asObservable();

  constructor() {
    // Initialize with the default point of sale
    this.current = this.pointsOfSaleList.find((x) => x.default === true) ?? this.pointsOfSaleList[0] ?? null;
    this.subject.next(this.current);
  }

  public initializePointsOfSale(list: PointOfSale[]): void {
    if (list && list.length > 0) {
      this.pointsOfSaleList = list;
    }
    const next = this.pointsOfSaleList?.find((x) => x?.default === true) ?? this.pointsOfSaleList?.[0] ?? null;

    this.current = next;
    this.subject.next(this.current);
  }

  public getCurrentPointOfSale(): PointOfSale | null {
    return this.current;
  }

  public changePointOfSale(selected: PointOfSale | PointOfSaleVm): void {
    this.current = this.normalizeToModel(selected);
    this.subject.next(this.current);
  }

  public getPointOfSaleFromStorage(): PointOfSaleVm {
    return {
      name: 'Point of Sale',
      stationCode: 'POS',
      code: 'POS',
      default: true,
      flagImageCode: 'POS',
      currency: { code: 'EUR', name: 'Euro', symbol: '€' },
      imgSrc: 'https://via.placeholder.com/150',
    } as PointOfSaleVm;
  }

  public setPointOfSaleToStorage(): void {
    // noop en Storybook
  }

  private normalizeToModel(input: PointOfSale | PointOfSaleVm): PointOfSale {
    const vm = input as PointOfSaleVm;
    return {
      code: (input as any).code,
      stationCode: (input as any).stationCode ?? vm.stationCode ?? '',
      currency: (input as any).currency ?? vm.currency!,
      countryCode: (input as any).countryCode ?? (vm as any).countryCode,
      otherCountryCodes: (input as any).otherCountryCodes ?? (vm as any).otherCountryCodes,
      isForRestOfCountries: (input as any).isForRestOfCountries ?? (vm as any).isForRestOfCountries,
      name: (input as any).name ?? vm.name,
      default: (input as any).default === true,
      flagImageCode: (input as any).flagImageCode ?? vm.flagImageCode,
    } as PointOfSale;
  }
}
