import { ChangeDetectionStrategy, Component, computed, inject, input, OnInit, signal } from '@angular/core';
import { DateDisplayComponent, DsButtonComponent } from '@dcx/ui/design-system';
import {
  ButtonConfig,
  ButtonStyles,
  CommonTranslationKeys,
  DeviceInfoService,
  KeyCodeEnum,
  LayoutSize,
  OperatingSystemType,
  PaxSegmentCheckinStatus,
} from '@dcx/ui/libs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { BoardingPassFormatType } from '../../../enums';
import {
  BoardingPassProxyService,
  DownloadBoardingPassRequest,
  DownloadBoardingPassService,
  IProcessBoardingPass,
  PROCESS_BOARDING_PASS_SERVICE,
  SessionService,
} from '../../../services';
import { AddWalletButtonComponent, AddWalletButtonConfig } from '../add-wallet-button';
import { TranslationKeys } from '../enums/translation-keys.enum';

import { BoardingPassVM } from './models/boarding-pass-vm.model';

@Component({
  selector: 'boarding-pass-preview',
  templateUrl: './boarding-pass-preview.component.html',
  styleUrls: ['./styles/boarding-pass-preview.styles.scss'],
  host: {
    class: 'boarding-pass-preview',
  },
  providers: [BoardingPassProxyService],
  imports: [TranslateModule, DsButtonComponent, DateDisplayComponent, AddWalletButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class BoardingPassPreviewComponent implements OnInit {
  // inputs
  public data = input.required<BoardingPassVM>();

  // State
  protected selectedSegmentIndex = signal(0);

  // internal vars
  public addWalletButtonConfig!: AddWalletButtonConfig;
  protected readonly translationKeys = TranslationKeys;
  protected readonly commonTranslationKeys = CommonTranslationKeys;

  // Computed
  protected segments = computed(() => this.data().segments);
  protected activeSegment = computed(() => this.segments()[this.selectedSegmentIndex()]);
  protected isPaxInStandByForActiveSegment = computed(() => {
    const booking = this.bookingSessionService.getBookingFromStorage();
    if (!booking) return false;

    const currentPax = booking.pax?.find((pax) => pax.id == this.data().paxId);
    const currentSegment = currentPax?.segmentsInfo?.find((segment) => segment.segmentId == this.activeSegment().id);

    return currentSegment?.status.toLocaleLowerCase() === PaxSegmentCheckinStatus.STAND_BY.toLowerCase();
  });

  // providers
  private readonly translate = inject(TranslateService);
  private readonly downloadBoardingPassService = inject(DownloadBoardingPassService);
  private readonly proccessBoardingPasses = inject<ReadonlyArray<IProcessBoardingPass>>(PROCESS_BOARDING_PASS_SERVICE);
  private readonly deviceInfoService = inject(DeviceInfoService);
  private readonly bookingSessionService = inject(SessionService);

  public pdfButtonConfig: ButtonConfig = {
    label: this.translate.instant(TranslationKeys.BoardingPass_DownloadPDF),
    layout: {
      size: LayoutSize.MEDIUM,
      style: ButtonStyles.SECONDARY,
    },
  };

  public ngOnInit(): void {
    this.setAddWalletButtonConfig();
    this.downloadBoardingPassService.initProcessBoardingPasses(this.proccessBoardingPasses);
    this.initBoardingPassesForAllSegments();
  }

  public onClickAddToWallet(formatType: BoardingPassFormatType): void {
    this.downloadBoardingPassService.processBoardingPassForSegment(formatType, this.activeSegment().id);
  }

  /**
   * Handles segment tab selection
   */
  protected onSegmentTabClick(index: number): void {
    this.selectedSegmentIndex.set(index);
  }

  /**
   * Handles keyboard navigation for tabs (Arrow keys)
   */
  protected onTabKeydown(event: KeyboardEvent, index: number): void {
    const segmentsCount = this.segments().length;
    let newIndex: number;

    switch (event.key) {
      case KeyCodeEnum.ARROW_LEFT:
        event.preventDefault();
        newIndex = index > 0 ? index - 1 : segmentsCount - 1;
        break;
      case KeyCodeEnum.ARROW_RIGHT:
        event.preventDefault();
        newIndex = index < segmentsCount - 1 ? index + 1 : 0;
        break;
      case KeyCodeEnum.HOME:
        event.preventDefault();
        newIndex = 0;
        break;
      case KeyCodeEnum.END:
        event.preventDefault();
        newIndex = segmentsCount - 1;
        break;
      default:
        return;
    }

    this.selectedSegmentIndex.set(newIndex);
    // Focus the new tab
    const tabElement = document.getElementById(`segment-tab-${newIndex}`);
    tabElement?.focus();
  }

  /**
   * Returns the tab id for aria-labelledby
   */
  protected getTabId(index: number): string {
    return `segment-tab-${index}`;
  }

  /**
   * Returns the tabpanel id for aria-controls
   */
  protected getTabPanelId(index: number): string {
    return `segment-panel-${index}`;
  }

  protected onClickDownloadPdf(): void {
    const data = this.buildDownloadBoardingPassRequest(BoardingPassFormatType.PDF);
    this.downloadBoardingPassService.downloadBoardingPassPdf(data);
  }

  private buildDownloadBoardingPassRequest(formatType: BoardingPassFormatType): DownloadBoardingPassRequest {
    return {
      paxId: this.data().paxId,
      journeyId: this.activeSegment().journeyId,
      formatType: formatType,
    };
  }

  private setAddWalletButtonConfig(): void {
    const formatType = this.getDeviceWalletFormatType();
    if (formatType) {
      this.addWalletButtonConfig = { formatType };
    } else {
      this.addWalletButtonConfig = undefined!;
    }
  }

  private getDeviceWalletFormatType(): BoardingPassFormatType | null {
    const osType = this.deviceInfoService.getOS();

    let formatType: BoardingPassFormatType | null = null;

    if (osType === OperatingSystemType.ANDROID) {
      formatType = BoardingPassFormatType.GOOGLE_PAY;
    } else if (osType === OperatingSystemType.IOS) {
      formatType = BoardingPassFormatType.APPLE_WALLET;
    }

    return formatType;
  }

  private initBoardingPassesForAllSegments(): void {
    if (this.getDeviceWalletFormatType() === null) return;
    const request = this.buildDownloadBoardingPassRequest(this.getDeviceWalletFormatType()!);
    this.downloadBoardingPassService.initBoardingPassesForAllSegments(request);
  }
}
