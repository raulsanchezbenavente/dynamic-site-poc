import { BehaviorSubject } from 'rxjs';

export class CurrencyServiceFake {
  private currencySubject = new BehaviorSubject<string | null>('USD');
  public currency$ = this.currencySubject.asObservable();

  public setCurrency(selectedCurrency: string): void {
    if (selectedCurrency) {
      this.currencySubject.next(selectedCurrency);
    }
  }

  public getCurrencyStorage(): string {
    return '';
  }

  public getCurrentCurrency(): string {
    return this.currencySubject.value || 'USD';
  }
}
