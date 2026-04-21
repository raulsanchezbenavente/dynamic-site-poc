import { inject, Injectable } from '@angular/core';
import { AccountV2Models } from '@dcx/module/api-clients';
import { TranslateService } from '@ngx-translate/core';
import { RfListOption } from 'reactive-forms';
import { CommonTranslationKeys } from '@dcx/ui/libs';

@Injectable({ providedIn: 'root' })
export class GenderMapperService {
  private readonly translateService = inject(TranslateService);

  public getGenderOptions(): RfListOption[] {
    const genderOptions = [
      {
        value: AccountV2Models.GenderType.Male,
      },
      {
        value: AccountV2Models.GenderType.Female,
      },
      {
        value: AccountV2Models.GenderType.Unknown,
      },
    ] as RfListOption[];

    return genderOptions.map((option) => ({
      ...option,
      content: this.translateService.instant(`${CommonTranslationKeys.Common_KeyNode}${option.value}`),
    }));
  }
}
