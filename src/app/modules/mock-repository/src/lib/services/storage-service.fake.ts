import { EnumStorageKey, ResponseSessionStorage, SelectedPassengersByJourney, Station } from '@dcx/ui/libs';
import { SessionStorageService } from 'angular-web-storage';

export class StorageServiceFake {
  private sessionStorageService = new SessionStorageService();

  private localStorageData: { [key: string]: string } = {};

  private keysResponseSessionStorage: ResponseSessionStorage<SelectedPassengersByJourney> = {
    selected_passengers_by_journey: {
      'journey-1': [
        'PAXREF001',
        'PAXREF002',
        'PAXREF003',
        'PAXREF004',
        'PAXREF005',
        'PAXREF006',
        'PAXREF007',
        'PAXREF008',
        'PAXREF009',
      ],
    },
  };

  private sessionDataByCulture: Record<string, { stations: Station[] }> = {
    data_es: {
      stations: [
        {
          code: 'GIG',
          cityCode: 'RIO',
          countryCode: 'BR',
          cultureCode: 'es',
          macCode: 'GIG',
          name: 'Rio de Janeiro International',
          position: { latitude: '0', longitude: '0' },
          timeZoneCode: 'America/Sao_Paulo',
        },
        {
          code: 'PEI',
          cityCode: 'PEI',
          countryCode: 'CO',
          cultureCode: 'es',
          macCode: 'PEI',
          name: 'Matecaña International',
          position: { latitude: '0', longitude: '0' },
          timeZoneCode: 'America/Bogota',
        },
      ],
    },
    data_en: {
      stations: [
        {
          code: 'GIG',
          cityCode: 'RIO',
          countryCode: 'BR',
          cultureCode: 'en',
          macCode: 'GIG',
          name: 'Rio de Janeiro International',
          position: { latitude: '0', longitude: '0' },
          timeZoneCode: 'America/Sao_Paulo',
        },
        {
          code: 'PEI',
          cityCode: 'PEI',
          countryCode: 'CO',
          cultureCode: 'en',
          macCode: 'PEI',
          name: 'Matecaña International',
          position: { latitude: '0', longitude: '0' },
          timeZoneCode: 'America/Bogota',
        },
      ],
    },
  };

  constructor() {
    this.initializeLocalStorageDefaults();
  }

  private initializeLocalStorageDefaults(): void {
    if (!this.localStorageData[EnumStorageKey.PaxRegulatoryDetails]) {
      this.localStorageData[EnumStorageKey.PaxRegulatoryDetails] = '[]';
    }
  }

  public setSessionStorage(key: string, value: any, timeout: number = 0): void {
    if (value != null) {
      this.sessionStorageService.set(key, value, timeout, 't');
    }
  }

  public getSessionStorage(key: string): any {
    if (key.startsWith('data_')) {
      const normalizedKey = key.split('-')[0];
      const stationsData = this.sessionDataByCulture[normalizedKey];
      return stationsData || { stations: [] };
    }

    return this.keysResponseSessionStorage[key] || null;
  }

  public setLocalStorage(key: string, value: string): void {
    console.log(`StorageServiceFake: Setting localStorage - Key: ${key}, Value: ${value}`);
    this.localStorageData[key] = value;
  }

  public getLocalStorage(key: string): string | null {
    const value = this.localStorageData[key] || null;
    console.log(`StorageServiceFake: Getting localStorage - Key: ${key}, Value: ${value}`);
    return value;
  }
}
