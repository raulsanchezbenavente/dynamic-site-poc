import { RetrieveStationsDataFromCms } from './retrieve-stations-data-from-cms';
import { ResourcesDataOrigin } from '../../enums/enum-resources-data-origin';
import { ResourceType } from '../../../shared/enums/enum-resource-type';
import { of } from 'rxjs';

describe('RetrieveStationsDataFromCms', () => {
  let service: RetrieveStationsDataFromCms;
  let repositoryRetrieveProxyService: any;
  let cultureServiceEx: any;

  beforeEach(() => {
    const mockStations = [
      {
        code: 'STN1',
        name: 'Station 1',
        countryCode: 'US',
        cultureCode: 'en-US',
        macCode: 'MAC1',
        position: { latitude: '0', longitude: '0' },
        timeZoneCode: 'TZ1',
        cityCode: 'CITY1',
        isExternalStation: false
      },
      {
        code: 'STN2',
        name: 'Station 2',
        countryCode: 'US',
        cultureCode: 'en-US',
        macCode: 'MAC2',
        position: { latitude: '1', longitude: '1' },
        timeZoneCode: 'TZ2',
        cityCode: 'CITY2',
        isExternalStation: false
      }
    ];
    repositoryRetrieveProxyService = {
      retrieve: jasmine.createSpy('retrieve').and.returnValue(of(mockStations))
    };
    cultureServiceEx = { getCulture: jasmine.createSpy('getCulture').and.returnValue('en-US') };
    service = new RetrieveStationsDataFromCms(repositoryRetrieveProxyService, cultureServiceEx);
  });

  it('should set originType to CMS', () => {
    expect(service.originType).toBe(ResourcesDataOrigin.CMS);
  });

  it('should call retrieve with correct params and return stations', (done) => {
    service.retrieve().subscribe((stations) => {
      expect(repositoryRetrieveProxyService.retrieve).toHaveBeenCalledWith({
        culture: 'en-US',
        repositoryType: ResourceType.STATIONS,
      });
      expect(stations).toEqual([
        {
          code: 'STN1',
          name: 'Station 1',
          countryCode: 'US',
          cultureCode: 'en-US',
          macCode: 'MAC1',
          position: { latitude: '0', longitude: '0' },
          timeZoneCode: 'TZ1',
          cityCode: 'CITY1',
          isExternalStation: false
        },
        {
          code: 'STN2',
          name: 'Station 2',
          countryCode: 'US',
          cultureCode: 'en-US',
          macCode: 'MAC2',
          position: { latitude: '1', longitude: '1' },
          timeZoneCode: 'TZ2',
          cityCode: 'CITY2',
          isExternalStation: false
        }
      ]);
      done();
    });
  });
});
