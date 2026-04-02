import { ChangeDetectorRef, Component, inject, input, OnInit } from '@angular/core';
import { StatusTagComponent, StatusTagConfig, StatusTagType } from '@dcx/ui/design-system';
import { JourneyStatus } from '@dcx/ui/libs';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'journey-status-tag',
  templateUrl: './journey-status-tag.component.html',
  host: {
    class: 'journey-status-tag',
  },
  imports: [StatusTagComponent],
  standalone: true,
})
export class JourneyStatusComponent implements OnInit {
  public status = input.required<JourneyStatus>();

  public journeyStatusTagConfig!: StatusTagConfig;

  private readonly translate = inject(TranslateService);
  private readonly cdr = inject(ChangeDetectorRef);

  public ngOnInit(): void {
    this.setJourneyStatusTagConfig();
  }

  private setJourneyStatusTagConfig(): void {
    this.journeyStatusTagConfig = {
      text: this.translate.instant(`Journey.Status.${this.status()}`),
      status: this.getStatusTagType(),
    };
    this.cdr.markForCheck();
  }

  private getStatusTagType(): StatusTagType {
    switch (this.status()) {
      case JourneyStatus.LANDED:
        return StatusTagType.SUCCESS;
      case JourneyStatus.ON_TIME:
        return StatusTagType.SUCCESS;
      case JourneyStatus.ON_ROUTE:
        return StatusTagType.SUCCESS;
      case JourneyStatus.OPEN:
        return StatusTagType.SUCCESS;
      case JourneyStatus.CLOSED:
        return StatusTagType.WARNING;
      case JourneyStatus.CANCELLED:
        return StatusTagType.ERROR;
      case JourneyStatus.DEPARTED:
        return StatusTagType.SUCCESS;
      case JourneyStatus.DIVERTED:
        return StatusTagType.WARNING;
      case JourneyStatus.DELAYED:
        return StatusTagType.WARNING;
      case JourneyStatus.RETURNED:
        return StatusTagType.WARNING;
      case JourneyStatus.CONFIRMED:
        return StatusTagType.SUCCESS;
      default:
        return StatusTagType.SUCCESS;
    }
  }
}
