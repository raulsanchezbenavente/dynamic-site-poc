import { RetrieveMarketsDataFromCms } from './retrieve-markets-data-from-cms.service';
import { RepositoryRetrieveProxyService } from '../../proxies';
import { ResourcesDataOrigin } from '../../../enums/enum-resources-data-origin';
import { ResourceType } from '../../../../shared/enums/enum-resource-type';
import { of } from 'rxjs';

describe('RetrieveMarketsDataFromCms', () => {
  let service: RetrieveMarketsDataFromCms;
  let repositoryRetrieveProxyService: any;
  let urlHelpers: any;

  beforeEach(() => {
  urlHelpers = { getCultureFromCurrentUrl: jasmine.createSpy('getCultureFromCurrentUrl').and.returnValue('en-US') };
  (globalThis as any).urlHelpers = urlHelpers;
    repositoryRetrieveProxyService = {
      retrieve: jasmine.createSpy('retrieve')
    };
    service = new RetrieveMarketsDataFromCms(repositoryRetrieveProxyService);
  });

  it('should set originType to CMS', () => {
    expect(service.originType).toBe(ResourcesDataOrigin.CMS);
  });

  it('should return empty array if response is falsy', (done) => {
    repositoryRetrieveProxyService.retrieve.and.returnValue(of(null));
    service.retrieve().subscribe((markets) => {
      expect(markets).toEqual([]);
      done();
    });
  });

  it('should map repository response to market pairs', (done) => {
    const mockResponse = [
      {
        origin: { code: 'AAA' },
        destinations: [
          { station: { code: 'BBB' }, isEnabled: true, isExternalMarket: false },
          { station: { code: 'CCC' }, isEnabled: false, isExternalMarket: true }
        ]
      },
      {
        origin: { code: 'DDD' },
        destinations: [
          { station: { code: 'EEE' }, isEnabled: true, isExternalMarket: true }
        ]
      }
    ];
    repositoryRetrieveProxyService.retrieve.and.returnValue(of(mockResponse));
    service.retrieve().subscribe((markets) => {
      expect(markets).toEqual([
        { origin: 'AAA', destination: 'BBB', isExternalMarket: false },
        { origin: 'BBB', destination: 'AAA', isExternalMarket: false },
        { origin: 'DDD', destination: 'EEE', isExternalMarket: true },
        { origin: 'EEE', destination: 'DDD', isExternalMarket: true }
      ]);
      done();
    });
  });
});
