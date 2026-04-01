import { PreferredCountriesByConfigStrategy } from './preferred-countries-by-config.strategy';
import { ManageCountriesTypeEnum } from '../../../enums';
import { Country, ManageCountriesStrategyOrder } from '../../../model';

describe('PreferredCountriesByConfigStrategy', () => {
  let strategy: PreferredCountriesByConfigStrategy;

  beforeEach(() => {
    strategy = new PreferredCountriesByConfigStrategy();
  });

  it('should have correct name', () => {
    expect(strategy.name).toBe(ManageCountriesTypeEnum.PREFERRED_COUNTRIES_BY_CONFIG_STRATEGY);
  });

  it('should process and sort countries by name', () => {
    const data: ManageCountriesStrategyOrder = {
      countries: [
        { code: 'US', name: 'United States', order: 2 } as Country,
        { code: 'CA', name: 'Canada', order: 1 } as Country,
      ],
      maxOrderValue: 0,
    };
    const result = strategy.process(data);
    expect(result[0].name).toBe('Canada');
    expect(result[1].name).toBe('United States');
    expect(data.maxOrderValue).toBe(3);
  });

  it('should handle missing order values', () => {
    const data: ManageCountriesStrategyOrder = {
      countries: [
        { code: 'US', name: 'United States' } as Country,
        { code: 'CA', name: 'Canada' } as Country,
      ],
      maxOrderValue: 0,
    };
    const result = strategy.process(data);
    expect(result.length).toBe(2);
    expect(data.maxOrderValue).toBeNaN(); // Because +undefined is NaN
  });
});
