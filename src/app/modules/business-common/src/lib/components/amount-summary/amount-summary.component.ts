import { DOCUMENT, NgTemplateOutlet } from '@angular/common';
import {
  AfterViewInit,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  input,
  OnDestroy,
  OnInit,
  output,
  signal,
  ViewChild,
} from '@angular/core';
import { DsButtonComponent, PriceCurrencyComponent } from '@dcx/ui/design-system';
import { ButtonConfig, ButtonStyles, CommonTranslationKeys, LayoutSize, ViewportSizeService } from '@dcx/ui/libs';
import { TranslateService } from '@ngx-translate/core';

import { AmountSummaryNavigationService } from '../../services';

import { TranslationKeys } from './enums/translation-keys.enum';
import { AmountSummaryVM } from './models/amount-summary-vm.model';

@Component({
  selector: 'amount-summary',
  templateUrl: './amount-summary.component.html',
  styleUrl: './styles/amount-summary.styles.scss',
  host: { class: 'amount-summary' },
  imports: [PriceCurrencyComponent, DsButtonComponent, NgTemplateOutlet],
  standalone: true,
})
export class AmountSummaryComponent implements OnInit, AfterViewInit, OnDestroy {
  protected readonly translationKeys = TranslationKeys;

  public readonly data = input.required<AmountSummaryVM>();

  @ViewChild('primaryButton') private readonly primaryButtonComponent?: DsButtonComponent;

  private readonly translate = inject(TranslateService);
  private readonly hostElement = inject(ElementRef<HTMLElement>);
  private readonly document = inject(DOCUMENT);
  public primaryActionClicked = output<void>();
  public secondaryActionClicked = output<void>();
  // Outputs for navigation
  public navigationPreviousClicked = output<void>();
  public navigationNextClicked = output<void>();

  public isVisibleSecondaryButton = signal<boolean>(false);
  public primaryButtonConfig: ButtonConfig = {
    label: this.translate.instant(CommonTranslationKeys.Common_Confirm_Btn),
    layout: {
      size: LayoutSize.MEDIUM,
      style: ButtonStyles.ACTION,
    },
  };
  public secondaryButtonConfig: ButtonConfig = {
    label: this.translate.instant(CommonTranslationKeys.Common_Cancel_Btn),
    layout: {
      size: LayoutSize.MEDIUM,
      style: ButtonStyles.SECONDARY,
    },
  };

  public previousButtonConfig: ButtonConfig = {
    label: this.translate.instant(CommonTranslationKeys.Common_Previous_Btn),
    layout: { size: LayoutSize.MEDIUM, style: ButtonStyles.SECONDARY },
  };

  public nextButtonConfig: ButtonConfig = {
    label: this.translate.instant(CommonTranslationKeys.Common_Next_Btn),
    layout: { size: LayoutSize.MEDIUM, style: ButtonStyles.ACTION },
  };

  public isResponsive = signal(false);
  private mediaQuery!: MediaQueryList;
  private mediaQueryListener!: (event: MediaQueryListEvent) => void;
  private resizeObserver?: ResizeObserver;

  // providers
  private readonly viewportSizeService = inject(ViewportSizeService);

  // Navigation service
  private readonly amountSummaryNavigation = inject(AmountSummaryNavigationService);

  // Navigation computed properties - Fixed to show buttons correctly
  public readonly showPreviousButton = computed(
    () => this.amountSummaryNavigation.hasMultipleItems() && this.amountSummaryNavigation.canNavigatePrevious()
  );

  public readonly showNextButton = computed(
    () => this.amountSummaryNavigation.hasMultipleItems() && this.amountSummaryNavigation.canNavigateNext()
  );

  private readonly registerDisabledEffect = effect(() => {
    this.primaryButtonConfig = this.data().primaryButton ?? this.primaryButtonConfig;
    this.secondaryButtonConfig = this.data().secondaryButton ?? this.secondaryButtonConfig;
    this.previousButtonConfig = this.data().previousButton ?? this.previousButtonConfig;
    this.nextButtonConfig = this.data().nextButton ?? this.nextButtonConfig;
    this.updatePrimaryButtonStyle();
  });

  public ngOnInit(): void {
    this.internalInit();
  }

  public ngAfterViewInit(): void {
    this.observeAmountSummaryHeight();
  }

  public ngOnDestroy(): void {
    if (this.mediaQuery && this.mediaQueryListener) {
      this.mediaQuery.removeEventListener('change', this.mediaQueryListener);
    }
    this.resizeObserver?.disconnect();
    this.document?.body?.style.removeProperty('--amount-summary-height');
  }

  /**
   * Focuses the primary action button
   */
  public focusPrimaryButton(): void {
    this.primaryButtonComponent?.focus();
  }

  public onPrimaryAction(): void {
    this.primaryActionClicked.emit();
  }

  public onSecondaryAction(): void {
    this.secondaryActionClicked.emit();
  }

  public onNavigationPrevious(): void {
    const previousItemId = this.amountSummaryNavigation.getPreviousItem();
    if (previousItemId) {
      this.navigationPreviousClicked.emit();
    }
  }

  public onNavigationNext(): void {
    const nextItemId = this.amountSummaryNavigation.getNextItem();
    if (nextItemId) {
      this.navigationNextClicked.emit();
    }
  }

  private internalInit(): void {
    this.setIsResponsive();
  }

  private updatePrimaryButtonStyle(): void {
    if (this.amountSummaryNavigation.isNavigationEnabled()) {
      this.primaryButtonConfig = {
        ...this.primaryButtonConfig,
        layout: {
          ...this.primaryButtonConfig.layout,
          style: this.showNextButton() ? ButtonStyles.SECONDARY : ButtonStyles.ACTION,
        },
      };
    }
  }

  private setIsResponsive(): void {
    const breakpoint = this.viewportSizeService.getComponentLayoutBreakpoint('--amount-summary-layout-breakpoint');

    this.mediaQuery = globalThis.matchMedia(`(max-width: ${breakpoint}px)`);
    this.isResponsive.set(this.mediaQuery.matches);
    this.updateAmountSummaryHeight();

    this.mediaQueryListener = (event: MediaQueryListEvent): void => {
      this.isResponsive.set(event.matches);
      this.updateAmountSummaryHeight();
    };

    this.mediaQuery.addEventListener('change', this.mediaQueryListener);
  }

  private observeAmountSummaryHeight(): void {
    if (!this.hostElement?.nativeElement) {
      return;
    }

    if ('ResizeObserver' in globalThis) {
      this.resizeObserver = new ResizeObserver(() => this.updateAmountSummaryHeight());
      this.resizeObserver.observe(this.hostElement.nativeElement);
    }

    queueMicrotask(() => this.updateAmountSummaryHeight());
  }

  private updateAmountSummaryHeight(): void {
    if (!this.document?.body || !this.hostElement?.nativeElement) {
      return;
    }

    const height = Math.round(this.hostElement.nativeElement.getBoundingClientRect().height);
    document.documentElement.style.setProperty('--amount-summary-height', `${height}px`);
  }
}
