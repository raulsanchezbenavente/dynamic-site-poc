import { Component, computed, inject, input } from '@angular/core';
import { CultureServiceEx , CommonTranslationKeys } from '@dcx/ui/libs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { TransportOperatedBy } from './models/transport-operated-by.model';

@Component({
  selector: 'transport-operated-by',
  templateUrl: './transport-operated-by.component.html',
  styleUrls: ['./styles/transport-operated-by.styles.scss'],
  host: {
    class: 'transport-operated-by',
  },
  imports: [TranslateModule],
  standalone: true,
})
export class TransportOperatedByComponent {
  public data = input.required<TransportOperatedBy[]>();

  private readonly translateService = inject(TranslateService);
  private readonly cultureService = inject(CultureServiceEx);

  public readonly operatedByText = computed(() => {
    const carriers = this.data();
    const operatedByLabel = this.translateService.instant(CommonTranslationKeys.Common_Carriers_OperatedBy);

    const locale = this.cultureService.getLanguageAndRegion();

    const formatter = new Intl.ListFormat(locale, {
      style: 'long',
      type: 'conjunction',
    });
    const names = carriers.map((carrier) => carrier.name);
    const formattedList = formatter.format(names);

    return `${operatedByLabel} ${formattedList}`;
  });
}
