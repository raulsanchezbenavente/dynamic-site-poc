import { PreferredCountryByArrivalStationStrategy } from './preferred-country-by-arrival-station.strategy';
import { ManageCountriesTypeEnum } from '../../../enums';
import { Country, ManageCountriesStrategyOrder, Station } from '../../../model';

describe('PreferredCountryByArrivalStationStrategy', () => {
  let strategy: PreferredCountryByArrivalStationStrategy;
  let mockSessionStore: any;
  let mockStorageService: any;

  beforeEach(() => {
    mockSessionStore = {
      getSession: jasmine.createSpy().and.returnValue({
        session: {
          booking: {
            journeys: [
              { destination: { iata: 'JFK' }, origin: { iata: 'LAX' } },
            ],
          },
        },
      }),
    };
    mockStorageService = {
      getSessionStorage: jasmine.createSpy().and.returnValue({
        stations: [
          { code: 'JFK', countryCode: 'US' } as Station,
        ],
      }),
    };
    strategy = new PreferredCountryByArrivalStationStrategy(mockStorageService, mockSessionStore);
  });

  it('should have correct name', () => {
    expect(strategy.name).toBe(ManageCountriesTypeEnum.PREFERRED_COUNTRIES_BY_ARRIVAL_STATION_STRATEGY);
  });

  it('should process and update country order for arrival station', () => {
    const data: ManageCountriesStrategyOrder = {
      countries: [
        { code: 'US', name: 'United States', order: 1 } as Country,
        { code: 'CA', name: 'Canada', order: 2 } as Country,
      ],
      maxOrderValue: 1,
    };
    const result = strategy.process(data);
    expect(result[0].name).toBe('Canada');
    expect(result[1].name).toBe('United States');
    expect(data.countries[0].order).toBe(3);
    expect(data.countries[1].order).toBe(1);
  });

  it('should not update order if no matched station', () => {
    mockStorageService.getSessionStorage.and.returnValue({ stations: [] });
    const data: ManageCountriesStrategyOrder = {
      countries: [
        { code: 'US', name: 'United States', order: 1 } as Country,
        { code: 'CA', name: 'Canada', order: 2 } as Country,
      ],
      maxOrderValue: 1,
    };
    const result = strategy.process(data);
    expect(result.length).toBe(2);
    expect(data.countries[0].order).toBe(2);
    expect(data.countries[1].order).toBe(1);
  });

  it('should return countries unchanged if no journeys', () => {
    mockSessionStore.getSession.and.returnValue({ session: { booking: { journeys: [] } } });
    const data: ManageCountriesStrategyOrder = {
      countries: [
        { code: 'US', name: 'United States', order: 1 } as Country,
        { code: 'CA', name: 'Canada', order: 2 } as Country,
      ],
      maxOrderValue: 1,
    };
    const result = strategy.process(data);
    expect(result).toEqual(data.countries.sort((a, b) => a.name!.localeCompare(b.name!)));
  });
});
