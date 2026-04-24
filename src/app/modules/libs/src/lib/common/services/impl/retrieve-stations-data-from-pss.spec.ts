import { RetrieveStationsDataFromPss } from './retrieve-stations-data-from-pss';
import { CultureServiceEx } from '../../../core/services/culture-service-ex/culture-ex.service';
import { ResourcesDataOrigin } from '../../enums/enum-resources-data-origin';
import { ResourceType } from '../../../shared/enums/enum-resource-type';
import { of } from 'rxjs';

describe('RetrieveStationsDataFromPss', () => {
  let service: RetrieveStationsDataFromPss;
  let resourcesRetrieveProxyService: any;
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
    resourcesRetrieveProxyService = {
      retrieve: jasmine.createSpy('retrieve').and.returnValue(of(mockStations))
    };
    cultureServiceEx = { getCulture: jasmine.createSpy('getCulture').and.returnValue('en-US') };
    service = new RetrieveStationsDataFromPss(resourcesRetrieveProxyService, cultureServiceEx);
  });

  it('should set originType to PSS', () => {
    expect(service.originType).toBe(ResourcesDataOrigin.PSS);
  });

  it('should call retrieve with correct params and return stations', (done) => {
    service.retrieve().subscribe((stations) => {
      expect(resourcesRetrieveProxyService.retrieve).toHaveBeenCalledWith({
        repositoryType: ResourceType.STATIONS,
        culture: 'en-US',
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
