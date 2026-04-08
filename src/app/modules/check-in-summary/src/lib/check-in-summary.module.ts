import { NgModule } from '@angular/core';
import { COMPONENT_MAIN } from '@dcx/ui/libs';
import { TranslateModule } from '@ngx-translate/core';

import { CheckInSummaryComponent } from './check-in-summary.component';

@NgModule({
  imports: [CheckInSummaryComponent, TranslateModule.forChild()],
  declarations: [],
  providers: [
    {
      provide: COMPONENT_MAIN,
      useValue: [CheckInSummaryComponent],
      multi: true,
    },
  ],
  exports: [CheckInSummaryComponent],
})
export class CheckInSummaryModule {}
