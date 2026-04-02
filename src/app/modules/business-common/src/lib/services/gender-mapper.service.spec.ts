import { TestBed } from '@angular/core/testing';
import { AccountV2Models } from '@dcx/module/api-clients';
import { TranslateService } from '@ngx-translate/core';

import { GenderMapperService } from './gender-mapper.service';

describe('GenderMapperService', () => {
  let service: GenderMapperService;
  let translateServiceSpy: jasmine.SpyObj<TranslateService>;

  beforeEach(() => {
    translateServiceSpy = jasmine.createSpyObj('TranslateService', ['instant']);

    TestBed.configureTestingModule({
      providers: [
        GenderMapperService,
        { provide: TranslateService, useValue: translateServiceSpy },
      ],
    });

    service = TestBed.inject(GenderMapperService);
  });

  it('should return the available gender options with translated content', () => {
    translateServiceSpy.instant.and.callFake((key: string) => `translated:${key}`);

    const options = service.getGenderOptions();

    expect(options).toEqual([
      {
        value: AccountV2Models.GenderType.Male,
        content: 'translated:Common.Male',
      },
      {
        value: AccountV2Models.GenderType.Female,
        content: 'translated:Common.Female',
      },
      {
        value: AccountV2Models.GenderType.Unknown,
        content: 'translated:Common.Unknown',
      },
    ]);

    expect(translateServiceSpy.instant).toHaveBeenCalledTimes(3);
    expect(translateServiceSpy.instant).toHaveBeenCalledWith('Common.Male');
    expect(translateServiceSpy.instant).toHaveBeenCalledWith('Common.Female');
    expect(translateServiceSpy.instant).toHaveBeenCalledWith('Common.Unknown');
  });
});
