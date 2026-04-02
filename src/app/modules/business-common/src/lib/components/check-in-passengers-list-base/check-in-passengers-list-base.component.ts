import { Component, inject, input, OnInit, signal } from '@angular/core';
import { PaxCheckinService, SegmentCheckIn } from '@dcx/ui/api-layer';
import {
  ButtonConfig,
  ButtonStyles,
  DeviceInfoService,
  DeviceType,
  EnumStorageKey,
  LayoutSize,
  PaxSegmentCheckinStatus,
  StorageService,
} from '@dcx/ui/libs';
import { TranslateService } from '@ngx-translate/core';

import { BoardingPassFormatType, CheckInCommonTranslationKeys } from '../../enums';
import {
  BOARDING_PASS_VM_BUILDER_SERVICE,
  DownloadBoardingPassRequest,
  DownloadBoardingPassService,
  IProcessBoardingPass,
  PROCESS_BOARDING_PASS_SERVICE,
} from '../../services';
import { BoardingPassOffCanvasData } from '../boarding-pass/boarding-pass-off-canvas';
import { CheckInSummaryPassengerVM } from '../check-in-summary';

@Component({
  template: '',
  standalone: true,
})
export abstract class CheckInPassengersListBaseComponent implements OnInit {
  public passengers = input.required<CheckInSummaryPassengerVM[]>();
  public journeyId = input.required<string>();

  public passengerStatus: { [key: string]: string } = {};
  public passengerSeatsDisplay: { [paxId: string]: string } = {};
  public downloadButtonConfig!: ButtonConfig;
  public isMobile!: boolean;
  public showBoardingPassPreview = signal(false);
  public boardingPassOffCanvasData = signal<BoardingPassOffCanvasData | null>(null);
  public segmentsCheckInStatus = signal<SegmentCheckIn[]>([]);
  public paxSegmentCheckinStatus = PaxSegmentCheckinStatus;
  public isOcaEnabled = false;

  // providers
  protected readonly translate = inject(TranslateService);
  protected readonly proccessBoardingPasses =
    inject<ReadonlyArray<IProcessBoardingPass>>(PROCESS_BOARDING_PASS_SERVICE);
  private readonly boardingPassVMBuilderService = inject(BOARDING_PASS_VM_BUILDER_SERVICE);
  private readonly deviceInfoService = inject(DeviceInfoService);
  private readonly downloadBoardingPassService = inject(DownloadBoardingPassService);
  private readonly checkInService = inject(PaxCheckinService);
  private readonly storageService = inject(StorageService);

  public ngOnInit(): void {
    this.internalInit();
  }

  public hasOverbookedSegment(passenger: CheckInSummaryPassengerVM, segmentId?: string): boolean {
    return this.hasSegmentWithStatus(passenger, PaxSegmentCheckinStatus.OVERBOOKED, segmentId);
  }

  public hasStandBySegment(passenger: CheckInSummaryPassengerVM, segmentId?: string): boolean {
    return this.hasSegmentWithStatus(passenger, PaxSegmentCheckinStatus.STAND_BY, segmentId);
  }

  public shouldFollowOverbookingPath(passenger: CheckInSummaryPassengerVM, segmentId?: string): boolean {
    return (
      this.hasOverbookedSegment(passenger, segmentId) ||
      (!this.isOcaEnabled && this.hasStandBySegment(passenger, segmentId))
    );
  }

  public onClickDownload(passenger: CheckInSummaryPassengerVM): void {
    this.showBoardingPassPreview.set(true);
    if (this.isMobile) {
      this.boardingPassOffCanvasData.set({
        boardingPassVM: this.boardingPassVMBuilderService.getBoardingPassVM({
          paxId: passenger.id,
          journeyId: this.journeyId(),
        }),
      });
      return;
    }
    this.downloadBoardingPassPdf(passenger);
  }

  public onCloseOffCanvas(): void {
    this.showBoardingPassPreview.set(false);
  }

  public canPassengerDownloadBoardingPassForSegment(paxId: string, segmentId?: string): boolean {
    const segments = this.segmentsCheckInStatus?.() ?? [];

    if (!segments.length || !segmentId) return false;

    const segment = segments.find((s) => s.segmentId === segmentId);
    if (!segment) return false;

    const pax = segment.pax?.find((p) => p.paxId === paxId);
    return pax?.canDownloadBoardingPass ?? false;
  }

  private internalInit(): void {
    this.downloadBoardingPassService.initProcessBoardingPasses(this.proccessBoardingPasses);
    this.loadOcaEnabledFromSession();
    this.setIsMobile();
    this.setDownloadButtonConfig();
    this.setPassengerStatus();
    this.setPassengerSeatsDisplay();
    this.loadCheckInStatus();
  }

  private setDownloadButtonConfig(): void {
    this.downloadButtonConfig = {
      label: this.translate.instant(CheckInCommonTranslationKeys.CheckIn_BoardingPass_Download_Button),
      layout: {
        size: LayoutSize.SMALL,
        style: ButtonStyles.SECONDARY,
      },
    };
  }

  private setPassengerStatus(): void {
    for (const passenger of this.passengers()) {
      this.passengerStatus[passenger.id] = passenger.status.toLowerCase();
    }
  }

  private downloadBoardingPassPdf(passenger: CheckInSummaryPassengerVM): void {
    const data: DownloadBoardingPassRequest = {
      paxId: passenger.id,
      journeyId: this.journeyId(),
      formatType: BoardingPassFormatType.PDF,
    };
    this.downloadBoardingPassService.downloadBoardingPassPdf(data);
  }

  /**
   * Behavior:
   * - If the passenger has no assigned seats, returns a single "--".
   * - If at least one seat is assigned, keeps positional order replacing empty entries with "--".
   *   Example:
   *     ['2A', '']   → "2A, -"
   *     ['', '2C']   → "-, 2C"
   *     ['2A', '2C'] → "2A, 2C"
   *     ['', '']     → "-"
   *
   * Result is stored in `passengerSeatsDisplay` mapped by passenger ID.
   */
  private setPassengerSeatsDisplay(): void {
    for (const passenger of this.passengers()) {
      const seatsArray = passenger.seats ?? [];

      // Detect if at least one seat is actually assigned (non-empty string)
      const hasAnySeatAssigned = seatsArray.some((s) => !!s && s.trim() !== '');

      if (!hasAnySeatAssigned || this.hasOverbookedSegment(passenger) || this.hasStandBySegment(passenger)) {
        // No seats at all -> single "--"
        this.passengerSeatsDisplay[passenger.id] = '--';
        continue;
      }

      // We have at least one real seat somewhere.
      // We must preserve position for each segment, replacing empty with "-".
      const normalizedSeats = seatsArray.map((s) => {
        const trimmed = (s || '').trim();
        return trimmed === '' ? '-' : trimmed;
      });

      this.passengerSeatsDisplay[passenger.id] = normalizedSeats.join(', ');
    }
  }

  private setIsMobile(): void {
    this.isMobile = this.deviceInfoService.getDeviceType() === DeviceType.MOBILE;
  }

  private loadCheckInStatus(): void {
    this.checkInService.getCheckinStatus().subscribe({
      next: (response) => {
        this.segmentsCheckInStatus.set(response.result?.data || []);
      },
      error: (error) => {
        console.error('Error fetching the check-in status', error);
      },
    });
  }

  private hasSegmentWithStatus(
    passenger: CheckInSummaryPassengerVM,
    status: PaxSegmentCheckinStatus,
    segmentId?: string
  ): boolean {
    return (
      passenger.segmentsInfo?.some(
        (segment) => segment.status === status && (!segmentId || segment.segmentId === segmentId)
      ) ?? false
    );
  }

  private loadOcaEnabledFromSession(): void {
    this.isOcaEnabled = this.storageService.getSessionStorage(EnumStorageKey.IsOcaEnabled) === true;
  }
}
