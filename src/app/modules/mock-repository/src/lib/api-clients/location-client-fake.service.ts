import { Injectable } from '@angular/core';
import { LocationModels } from '@dcx/module/api-clients';
import { delay, Observable, of } from 'rxjs';

@Injectable()
export class LocationClientFakeService {
  private ensureVersion(version?: string): string {
    return version === undefined || version === null ? '1' : version;
  }

  public location(): Observable<LocationModels.QueryResponse_1OfOfLocationAndApplicationAnd_0AndCulture_neutralAndPublicKeyToken_null> {
    return of({
      success: true,
    } as LocationModels.QueryResponse_1OfOfLocationAndApplicationAnd_0AndCulture_neutralAndPublicKeyToken_null).pipe(
      delay(2000)
    );
  }

  public sessionSettings(): Observable<LocationModels.SessionSettingsResponseDto> {
    return of({
      result: {
        result: true,
        data: {
          search: {
            origin: 'NBO',
            destination: '',
            pax: {},
            tripType: '',
          },
          currency: {
            value: 'KES',
          },
          pointOfSale: '',
          countryCode: 'KE',
          isForRestOfCountries: false,
          source: 'Default',
          cityCode: 'MAD',
        } as LocationModels.SessionSettingsResponse,
      },
      success: true,
    } as LocationModels.SessionSettingsResponseDto).pipe(delay(2000));
  }
}
