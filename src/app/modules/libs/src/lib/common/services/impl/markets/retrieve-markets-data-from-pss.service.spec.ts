import { RetrieveMarketsDataFromPss } from './retrieve-markets-data-from-pss.service';
import { ResourcesDataOrigin } from '../../../enums/enum-resources-data-origin';
import { ResourceType } from '../../../../shared/enums/enum-resource-type';
import { of } from 'rxjs';

describe('RetrieveMarketsDataFromPss', () => {
  let service: RetrieveMarketsDataFromPss;
  let resourcesRetrieveProxyService: any;
  let cultureServiceEx: any;

  beforeEach(() => {
    const mockMarkets = [
      {
        origin: 'AAA',
        destination: 'BBB',
        isExternalMarket: false
      },
      {
        origin: 'CCC',
        destination: 'DDD',
        isExternalMarket: true
      }
    ];
    resourcesRetrieveProxyService = {
      retrieve: jasmine.createSpy('retrieve').and.returnValue(of(mockMarkets))
    };
    cultureServiceEx = { getCulture: jasmine.createSpy('getCulture').and.returnValue('en-US') };
    service = new RetrieveMarketsDataFromPss(resourcesRetrieveProxyService, cultureServiceEx);
  });

  it('should set originType to PSS', () => {
    expect(service.originType).toBe(ResourcesDataOrigin.PSS);
  });

  it('should call retrieve with correct params and return markets', (done) => {
    service.retrieve().subscribe((markets) => {
      expect(resourcesRetrieveProxyService.retrieve).toHaveBeenCalledWith({
        repositoryType: ResourceType.MARKETS,
        culture: 'en-US',
      });
      expect(markets).toEqual([
        {
          origin: 'AAA',
          destination: 'BBB',
          isExternalMarket: false
        },
        {
          origin: 'CCC',
          destination: 'DDD',
          isExternalMarket: true
        }
      ]);
      done();
    });
  });
});
