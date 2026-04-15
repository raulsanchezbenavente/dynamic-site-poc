import { Component, effect, inject, input, OnInit } from '@angular/core';
import { JourneyScheduleComponent } from '@dcx/ui/business-common';
import { DsButtonComponent } from '@dcx/ui/design-system';
import {
  ButtonConfig,
  ButtonStyles,
  IbeEventRedirectType,
  JourneyStatus,
  LayoutSize,
  LinkTarget,
  RedirectionService,
} from '@dcx/ui/libs';
import { TranslateService } from '@ngx-translate/core';

import { ManageBookingCardVM } from './models/manage-booking-card-vm.model';
import { ManageBookingCardConfig } from './models/manage-booking-card.config';

@Component({
  selector: 'manage-booking-card',
  templateUrl: './manage-booking-card.component.html',
  styleUrls: ['./styles/manage-booking-card.styles.scss'],
  host: {
    class: 'manage-booking-card',
  },
  imports: [JourneyScheduleComponent, DsButtonComponent],
  standalone: true,
})
export class ManageBookingCardComponent implements OnInit {
  public readonly config = input.required<ManageBookingCardConfig>();
  public readonly data = input.required<ManageBookingCardVM>();

  public checkInButtonConfig!: ButtonConfig;
  public manageButtonConfig!: ButtonConfig;

  protected readonly translate = inject(TranslateService);
  private readonly redirectService = inject(RedirectionService);

  public journeyStatus = JourneyStatus;

  // Reactive: recompute buttons when data changes.
  private readonly recomputeButtonsEffect = effect(() => {
    const data = this.data();
    if (!data) return;
    this.setButtonConfig();
  });

  public ngOnInit(): void {
    this.internalInit();
  }

  private internalInit(): void {
    this.setButtonConfig();
  }

  private setButtonConfig(): void {
    const data = this.data();
    this.checkInButtonConfig = {
      label: this.translate.instant('ManageBookingCard.CheckInButtonLabel'),
      link: {
        url: data.checkInDeepLinkUrl,
        target: LinkTarget.BLANK,
      },
      layout: {
        size: LayoutSize.MEDIUM,
        style: ButtonStyles.PRIMARY,
      },
    };

    this.manageButtonConfig = {
      label: this.translate.instant('ManageBookingCard.ManageButtonLabel'),
      link: {
        url: data.mmbDeepLinkUrl,
        target: LinkTarget.BLANK,
      },
      layout: {
        size: LayoutSize.MEDIUM,
        style: ButtonStyles.SECONDARY,
      },
    };
  }

  /**
   * Redirects to the Manage My Booking URL if present.
   * Guard: exits early when the MMB deep link is empty to avoid firing a useless redirect event.
   */
  public redirectMmb(): void {
    const url = this.data().mmbDeepLinkUrl;
    if (!url) return;
    this.redirectService.redirect(IbeEventRedirectType.externalRedirect, url);
  }

  /**
   * Redirects to the Check-in URL if present.
   * Guard: exits early when the Check-in deep link is empty to avoid firing a useless redirect event.
   */
  public redirectCheckin(): void {
    const url = this.data().checkInDeepLinkUrl;
    if (!url) return;
    this.redirectService.redirect(IbeEventRedirectType.externalRedirect, url);
  }
}
