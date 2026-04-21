import { Location } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  effect,
  inject,
  Inject,
  OnDestroy,
  signal,
  Signal,
  ViewChild,
} from '@angular/core';
import {
  DsButtonComponent,
  IconComponent,
  OffCanvasBodyDirective,
  OffCanvasComponent,
  OffCanvasConfig,
} from '@dcx/ui/design-system';
import {
  BUSINESS_CONFIG,
  BusinessConfig,
  ButtonConfig,
  createResponsiveSignal,
  GenerateIdPipe,
  IbeEventRedirectType,
  IconConfig,
  PointOfSale,
  PointOfSaleService,
  PointOfSaleVm,
  RedirectionService,
  ViewportSizeService,
  WindowHelper,
  CommonTranslationKeys,
} from '@dcx/ui/libs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { PointsOfSaleData } from './models/points-of-sale-data.model';
import { TranslationKeys } from './enums/translation-keys.enum';

@Component({
  selector: 'points-of-sale',
  templateUrl: './points-of-sale.component.html',
  styleUrls: ['./styles/points-of-sale.styles.scss'],
  host: { class: 'points-of-sale' },
  imports: [TranslateModule, IconComponent, OffCanvasComponent, OffCanvasBodyDirective, DsButtonComponent],
  standalone: true,
})
export class PointsOfSaleComponent implements OnDestroy {
  public data = signal<PointsOfSaleData>({ items: [] });

  @ViewChild(OffCanvasComponent)
  private readonly offCanvasRef?: OffCanvasComponent;
  private readonly redirectService = inject(RedirectionService);

  public isMainHeaderToggleLayout!: Signal<boolean>;
  private destroyMediaQueryListener: () => void = () => {};

  public pointsOfSaleVm!: PointOfSaleVm[];
  public selectedPointOfSale!: PointOfSaleVm;
  public offCanvasConfig!: OffCanvasConfig;
  public displayPopup = signal<boolean>(false);
  private arrowRestrictionIsActive: boolean = false;
  public triggerAriaLabel!: string;
  public triggerId!: string;
  public triggerIconConfig!: IconConfig;
  public actionButtonConfig!: ButtonConfig;
  public titleId: string = 'pointsOfSaleTitleId';

  private readonly viewportSizeService = inject(ViewportSizeService);

  private readonly flagPath = '/assets/ui_plus/imgs/countries-flags/{countryCode}.svg';
  private readonly otherFlagPath = '/assets/ui_plus/imgs/countries-flags/other.svg';
  private readonly logoPath = '/assets/ui_plus/imgs/logos/avianca-logo.svg';

  protected readonly translate = inject(TranslateService);
  protected readonly translationKeys = TranslationKeys;
  protected readonly commonTranslationKeys = CommonTranslationKeys;

  protected pointOfSaleToUpdate!: PointOfSaleVm;

  constructor(
    @Inject(BUSINESS_CONFIG)
    protected businessConfig: BusinessConfig,
    protected location: Location,
    protected changeDetectorRef: ChangeDetectorRef,
    protected generateId: GenerateIdPipe,
    private readonly pointOfSaleService: PointOfSaleService
  ) {
    this.pointOfSaleService.pointsOfSaleAvailable$?.subscribe(() => {
      if (this.pointOfSaleService.pointsOfSaleList.length > 0) {
        requestAnimationFrame(() => {
          this.data.set({ items: this.pointOfSaleService.pointsOfSaleList });
          this.internalInit();
        });
      }
    });
    this.triggerId = this.generateId.transform('pointsOfSaleSelectorId_');
    this.triggerIconConfig = {
      name: 'currency-circle',
    };
    effect(() => {
      if (this.displayPopup()) {
        if (this.arrowRestrictionIsActive) {
          return;
        }
        document.addEventListener('keydown', this.keydownListener, true);
        this.arrowRestrictionIsActive = true;
      } else {
        document.removeEventListener('keydown', this.keydownListener, true);
        this.arrowRestrictionIsActive = false;
      }
    });
  }

  private readonly keydownListener = (event: KeyboardEvent): void => {
    if (
      event.key === 'ArrowUp' ||
      event.key === 'ArrowDown' ||
      event.key === 'ArrowLeft' ||
      event.key === 'ArrowRight'
    ) {
      event.preventDefault();
      event.stopPropagation();
    }
  };

  public ngOnDestroy(): void {
    this.destroyMediaQueryListener();
  }

  private setIsMainHeaderToggleLayout(): void {
    const breakpoint = this.viewportSizeService.getComponentLayoutBreakpoint('--main-header-layout-breakpoint');
    const mediaQuery = `(max-width: ${breakpoint}px)`;

    [this.isMainHeaderToggleLayout, this.destroyMediaQueryListener] = createResponsiveSignal(mediaQuery);
  }

  public togglePopup(): void {
    this.displayPopup.set(!this.displayPopup());
  }

  public updateSelection(code: string): void {
    const foundPOS = this.pointsOfSaleVm.find((pos) => pos.code === code);
    if (foundPOS) {
      this.pointOfSaleToUpdate = foundPOS;
    }
  }

  public confirmSelection(): void {
    const previousPOS = this.selectedPointOfSale;
    this.selectedPointOfSale = this.pointOfSaleToUpdate;
    this.applySelection();
    this.closePopupAnimated();
    if (!this.isSameSelection(previousPOS)) {
      const url = WindowHelper.getLocation().href;
      this.redirectService.redirect(IbeEventRedirectType.externalRedirect, url);
    }
  }

  protected internalInit(): void {
    this.setIsMainHeaderToggleLayout();
    this.setOffCanvasConfig();
    this.setActionButtonConfig();
    this.pointsOfSaleVm = this.buildViewModel();
    this.selectedPointOfSale = this.getCurrentPointOfSale();
    this.pointOfSaleToUpdate = this.selectedPointOfSale;
    this.subscribeToPointOfSaleService();
  }

  protected getCurrentPointOfSale(): PointOfSaleVm {
    const pointOfSale = this.pointOfSaleService.getCurrentPointOfSale()!;
    return this.pointsOfSaleVm.find((pointOfSaleVM) => pointOfSaleVM.code === pointOfSale.code) || pointOfSale;
  }

  protected setOffCanvasConfig(): void {
    const resolvedHomeUrl = this.businessConfig.homeUrl ?? this.businessConfig.urlHome ?? '/';
    this.offCanvasConfig = {
      offCanvasHeaderConfig: {
        title: this.translate.instant(CommonTranslationKeys.Common_LogoAltText),
        imageSrc: this.logoPath,
        imageLink: { url: resolvedHomeUrl },
      },
      animation: true,
      ariaLabelledBy: this.triggerId,
      position: this.isMainHeaderToggleLayout() ? 'bottom' : 'top',
      panelClass: 'points-of-sale-offcanvas',
    };
  }

  protected setActionButtonConfig(): void {
    this.actionButtonConfig = {
      label: this.translate.instant(TranslationKeys.PointsOfSale_Button_Apply_Label),
    };
  }

  protected applySelection(): void {
    this.pointOfSaleService.changePointOfSale(this.selectedPointOfSale, true);
  }

  protected subscribeToPointOfSaleService(): void {
    this.pointOfSaleService.pointOfSale$.subscribe((newPointOfSale: PointOfSale | null) => {
      if (newPointOfSale) {
        const pointOfSale = this.pointsOfSaleVm.find((pointOfSaleVM) => pointOfSaleVM.code === newPointOfSale.code);
        if (pointOfSale) {
          this.selectedPointOfSale = pointOfSale;
        }
      }
    });
  }

  protected isSingleCountry(pointOfSaleModel: PointOfSale): boolean {
    return (
      !!pointOfSaleModel.countryCode &&
      !pointOfSaleModel.isForRestOfCountries &&
      !(pointOfSaleModel.otherCountryCodes ?? []).length
    );
  }

  protected getFlagImg(code: string): string {
    return this.flagPath.replace('{countryCode}', code.toLowerCase());
  }

  protected buildViewModel(): PointOfSaleVm[] {
    const pointsOfSaleVm = this.data().items.map((pointOfSale) => {
      const { code, stationCode, currency, countryCode, otherCountryCodes, isForRestOfCountries } = pointOfSale;

      const pointOfSaleVm: PointOfSaleVm = {
        code,
        default: pointOfSale.default,
        flagImageCode: pointOfSale.flagImageCode,
        stationCode,
        currency,
        name: this.getName(pointOfSale),
        imgSrc: this.getImage(pointOfSale),
        countryCode,
        otherCountryCodes,
        isForRestOfCountries,
      };

      return pointOfSaleVm;
    });

    return this.sortViewModel(pointsOfSaleVm);
  }

  protected sortViewModel(pointsOfSaleVm: PointOfSaleVm[]): PointOfSaleVm[] {
    return pointsOfSaleVm.sort((a, b) => a.name.localeCompare(b.name));
  }

  private closePopupAnimated(): void {
    if (this.offCanvasRef) {
      this.offCanvasRef.dismiss();
    }
  }

  private isSameSelection(newPointOfSale: PointOfSaleVm): boolean {
    return this.selectedPointOfSale?.code === newPointOfSale.code;
  }

  private getName(pointOfSale: PointOfSale): string {
    if (pointOfSale.name) {
      return pointOfSale.name;
    }
    if (this.isSingleCountry(pointOfSale)) {
      return this.translate.instant(TranslationKeys.Country_KeyNode + pointOfSale.countryCode);
    }
    return this.translate.instant(TranslationKeys.PointsOfSale_Other_Country_Text);
  }

  private getImage(pointOfSale: PointOfSale): string {
    if (pointOfSale.flagImageCode && pointOfSale.code.toUpperCase() !== 'OTHER') {
      return this.getFlagImg(pointOfSale.flagImageCode);
    }

    return this.otherFlagPath;
  }

  // Rebuild view model and re-apply selection so translated names are refreshed
  protected updateViewModelForTranslations(): void {
    this.pointsOfSaleVm = this.buildViewModel();
    this.selectedPointOfSale = this.getCurrentPointOfSale();
    this.pointOfSaleToUpdate = this.selectedPointOfSale;
    this.applySelection();
    this.changeDetectorRef.markForCheck();
  }
}
