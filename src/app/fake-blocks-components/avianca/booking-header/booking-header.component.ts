import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { filter, Subject, takeUntil } from 'rxjs';

import { PageNavigationService } from '../../../services/page-navigation/page-navigation.service';
import { RouterHelperService } from '../../../services/router-helper/router-helper.service';

type BookingStep = {
  key: string;
  labelKey: string;
  pageIds: string[];
};

@Component({
  selector: 'booking-header',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './booking-header.component.html',
  styleUrl: './booking-header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookingHeaderComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly routerHelper = inject(RouterHelperService);
  private readonly pageNavigation = inject(PageNavigationService);
  private readonly destroy$ = new Subject<void>();

  public readonly bookingSteps: BookingStep[] = [
    { key: 'step-flights', labelKey: 'HEADER.STEPS.FLIGHTS', pageIds: ['1'] },
    { key: 'step-customize', labelKey: 'HEADER.STEPS.CUSTOMIZE', pageIds: ['1-1', '1-2'] },
    { key: 'step-payment', labelKey: 'HEADER.STEPS.PAYMENT', pageIds: ['1-3', '1-4'] },
  ];

  public readonly activeStepIndex = signal<number | null>(null);

  public ngOnInit(): void {
    this.updateActiveStep();
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe(() => this.updateActiveStep());
  }

  public ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  public isStepActive(index: number): boolean {
    return this.activeStepIndex() === index;
  }

  public isStepComplete(index: number): boolean {
    const active = this.activeStepIndex();
    return active !== null && active > index;
  }

  public homePath(): string {
    return this.pageNavigation.resolvePagePath('0');
  }

  public goHome(event: MouseEvent): void {
    event.preventDefault();
    void this.router.navigateByUrl(this.homePath());
  }

  private updateActiveStep(): void {
    const pageId = this.routerHelper.getCurrentPageId();
    let stepIndex = this.bookingSteps.findIndex((step) => step.pageIds.includes(pageId ?? ''));

    if (stepIndex === -1) {
      const path = this.router.url.split('?')[0];
      if (path.includes('/results')) {
        stepIndex = 0;
      } else if (path.includes('/personal-data') || path.includes('/extras')) {
        stepIndex = 1;
      } else if (path.includes('/payment') || path.includes('/thanks')) {
        stepIndex = 2;
      }
    }

    this.activeStepIndex.set(stepIndex === -1 ? null : stepIndex);
  }
}
