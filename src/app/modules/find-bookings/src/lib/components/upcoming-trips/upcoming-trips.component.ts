import { Component, computed, DestroyRef, ElementRef, inject, input, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CarriersDisplayMode } from '@dcx/ui/business-common';
import { DataNotFoundConfig } from '@dcx/ui/design-system';
import { TranslateService } from '@ngx-translate/core';

import { ManageBookingCardComponent } from '../manage-booking-card/manage-booking-card.component';
import { ManageBookingCardVM } from '../manage-booking-card/models/manage-booking-card-vm.model';
import { ManageBookingCardConfig } from '../manage-booking-card/models/manage-booking-card.config';

@Component({
  selector: 'upcoming-trips',
  templateUrl: './upcoming-trips.component.html',
  styleUrls: ['./styles/upcoming-trips.styles.scss'],
  host: {
    class: 'upcoming-trips',
  },
  imports: [ManageBookingCardComponent],
  standalone: true,
})
export class UpcomingTripsComponent implements OnInit {
  public readonly data = input.required<ManageBookingCardVM[]>();
  public readonly hasData = computed(() => this.data().length > 0);
  public readonly elementRef = inject(ElementRef);

  public manageBookingCardConfig!: ManageBookingCardConfig;
  public dataNotFoundConfig!: DataNotFoundConfig;

  private readonly translate = inject(TranslateService);
  private readonly destroyRef = inject(DestroyRef);

  public ngOnInit(): void {
    this.internalInit();
  }

  private internalInit(): void {
    this.setManageBookingCardConfig();
    this.setDataNotFoundConfig();
  }

  private setManageBookingCardConfig(): void {
    this.manageBookingCardConfig = {
      journeyScheduleConfig: {
        scheduleConfig: {
          carriersDisplayMode: CarriersDisplayMode.OPERATED_BY,
          showTotalDuration: false,
          legsDetailsPopoverConfig: {
            placement: 'end',
            offset: [0, 16],
          },
        },
      },
    };
  }

  private setDataNotFoundConfig(): void {
    this.dataNotFoundConfig = {
      text: '',
    };

    this.translate
      .stream('FindBookings.NoUpcomingTrips')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((text) => {
        this.dataNotFoundConfig = {
          ...this.dataNotFoundConfig,
          text,
        };
      });
  }
}
