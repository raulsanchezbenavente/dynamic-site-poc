import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  ContentChild,
  ElementRef,
  inject,
  Inject,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Optional,
  SimpleChanges,
  TemplateRef,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import {
  DsNgbTriggerEvent,
  EnumModalKeyEventType,
  GenerateIdPipe,
  KeyboardMouseInteractionService,
  KeyCodeEnum,
  MergeConfigsService,
  ModalKeyEventsDirective,
  ViewportSizeService,
} from '@dcx/ui/libs';
import { NgbPopover } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Options as PopperOptions } from '@popperjs/core';
import { Subscription } from 'rxjs';

import { IconButtonComponent, IconButtonConfig } from '../icon-button';
import { OffCanvasBodyDirective, OffCanvasHeaderComponent } from '../off-canvas';
import { OffCanvasConfig } from '../off-canvas/models/off-canvas-config.model';
import { OffCanvasComponent } from '../off-canvas/off-canvas.component';

import { PopoverHeaderDirective } from './directives/popover-header.directive';
import { PopoverConfig } from './models/popover.config';
import { POPOVER_CONFIG } from './tokens/popover-default-config.token';

@Component({
  selector: 'popover',
  templateUrl: './popover.component.html',
  styleUrls: ['./styles/popover.styles.scss'],
  encapsulation: ViewEncapsulation.None,
  host: { class: 'ds-popover' },
  imports: [
    TranslateModule,
    OffCanvasComponent,
    OffCanvasHeaderComponent,
    OffCanvasBodyDirective,
    IconButtonComponent,
    NgbPopover,
    NgTemplateOutlet,
    ModalKeyEventsDirective,
  ],
  standalone: true,
})
export class PopoverComponent implements OnInit, OnChanges, OnDestroy {
  @Input({ required: true }) public config!: PopoverConfig;
  @Input() public offCanvasConfig!: OffCanvasConfig;
  @Input() public closeButtonConfig?: Partial<IconButtonConfig>;
  @Input() public customClickHandlerWhenHover?: () => void;

  @ContentChild(PopoverHeaderDirective, { read: PopoverHeaderDirective })
  public popoverHeaderDirective?: PopoverHeaderDirective;

  @ViewChild('popoverRef') public popover!: NgbPopover;
  @ViewChild('offcanvas') public offcanvas!: TemplateRef<unknown>;
  @ViewChild('closeButton') public closeButton!: ElementRef<HTMLButtonElement>;
  @ViewChild('popoverTriggerButton') public popoverTrigger!: ElementRef<HTMLButtonElement>;
  @ViewChild('offCanvasTrigger') public offCanvasTrigger!: ElementRef<HTMLButtonElement>;

  public isPopoverOpen = false;
  public isResponsive = false;
  public modalKeyEventType = EnumModalKeyEventType.DEFAULT;
  public popoverContentId: string;
  public btnOpenPopoverId: string;
  public readonly DsNgbTriggerEvent = DsNgbTriggerEvent;

  protected readonly translateService = inject(TranslateService);

  public resolvedCloseButtonConfig!: Partial<IconButtonConfig>;
  public popperOptionsFn!: (options: Partial<PopperOptions>) => Partial<PopperOptions>;

  private mediaQuery!: MediaQueryList;
  private mediaQueryListener!: (event: MediaQueryListEvent) => void;
  private shouldRestoreFocus = true;

  protected windowWidthSubscription$!: Subscription;

  constructor(
    private readonly viewportSizeService: ViewportSizeService,
    private readonly mergeConfigsService: MergeConfigsService,
    private readonly changeDetector: ChangeDetectorRef,
    @Inject(POPOVER_CONFIG)
    @Optional()
    private readonly defaultConfig: PopoverConfig,
    private readonly generateIdPipe: GenerateIdPipe,
    private readonly interactionMode: KeyboardMouseInteractionService
  ) {
    this.popoverContentId = this.generateIdPipe.transform('popoverContentId_');
    this.btnOpenPopoverId = this.generateIdPipe.transform('btnOpenPopoverId_');
  }

  get hasProjectedHeader(): boolean {
    return !!this.popoverHeaderDirective;
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['config']) {
      this.initDefaultConfiguration();
      this.changeDetector.detectChanges();
    }
  }

  public ngOnInit(): void {
    this.initDefaultConfiguration();
    this.setCloseButtonConfig(this.closeButtonConfig);
    this.setIsResponsive();
  }

  public toggleOpen(): void {
    this.isPopoverOpen = !this.isPopoverOpen;
  }

  public onPopoverShown(): void {
    this.isPopoverOpen = true;

    if (this.isHoverTrigger() && this.interactionMode.isKeyboardMode()) {
      return;
    }

    requestAnimationFrame(() => {
      if (this.interactionMode.isKeyboardMode() && this.closeButton) {
        this.closeButton.nativeElement.focus();
      }

      // Override Bootstrap's default role="tooltip" to role="dialog" for interactive content
      const popoverElement = document.querySelector('ngb-popover-window');
      if (popoverElement) {
        popoverElement.setAttribute('role', 'dialog');
        popoverElement.setAttribute('aria-modal', 'true');
      }

      // Remove Bootstrap's default aria-describedby (appropriate for tooltips)
      // and use aria-controls instead (appropriate for interactive dialog popovers)
      const buttonElement = document.querySelector(`#${this.btnOpenPopoverId}`);
      if (buttonElement) {
        buttonElement.removeAttribute('aria-describedby');

        const bootstrapPopoverId = popoverElement?.getAttribute('id');
        if (bootstrapPopoverId) {
          buttonElement.setAttribute('aria-controls', bootstrapPopoverId);
        }
      }
    });
  }

  public onPopoverHidden(): void {
    this.isPopoverOpen = false;
    this.changeDetector.detectChanges();

    // Hover-trigger popovers must never restore focus to the trigger button:
    // - Mouse-initiated close (NGB mouseleave): focus was never moved — nothing to restore.
    // - Keyboard-initiated close (onTriggerBlur): already called closeWithoutFocusRestore()
    //   so shouldRestoreFocus is already false.
    // Attempting to restore focus here would put focus on the aria-hidden trigger button
    // (which is presentational in grid/gridcell contexts like the seatmap).
    if (!this.isHoverTrigger() && this.interactionMode.isKeyboardMode() && this.shouldRestoreFocus) {
      this.focusOnTrigger();
    }

    this.shouldRestoreFocus = true;
  }

  public onPopoverTriggerClick(): void {
    const isHoverTrigger = this.config.triggers === DsNgbTriggerEvent.HOVER;
    const hasCustomHandler = !!this.customClickHandlerWhenHover;

    if (isHoverTrigger) {
      if (this.interactionMode.isKeyboardMode()) {
        return;
      }

      if (hasCustomHandler) {
        this.customClickHandlerWhenHover!();
        setTimeout(() => {
          this.close();
        }, 0);
      }
    }
  }

  public onPopoverTriggerFocus(): void {
    if (this.isHoverTrigger() && this.interactionMode.isKeyboardMode()) {
      this.popover.open();
    }
  }

  private isHoverTrigger(): boolean {
    return this.config.triggers === DsNgbTriggerEvent.HOVER;
  }

  /** Manual keyboard handling for hover-trigger popovers (Enter/Space/Esc/Tab) */
  public onKeydown(event: KeyboardEvent): void {
    if (this.isHoverTrigger() && this.interactionMode.isKeyboardMode()) {
      if (event.key === KeyCodeEnum.ENTER || event.key === KeyCodeEnum.SPACE) {
        if (this.customClickHandlerWhenHover) {
          event.preventDefault();
          event.stopPropagation();
          this.customClickHandlerWhenHover();
          return;
        }
      }

      if (event.key === KeyCodeEnum.ESCAPE) {
        event.preventDefault();
        this.closeButtonClick();
        return;
      }

      if (event.key === KeyCodeEnum.TAB) {
        this.closeButtonClick();
        return;
      }
    }

    // TAB closes popover without restoring focus (allows natural navigation)
    if (this.interactionMode.isKeyboardMode() && this.isPopoverOpen && event.key === KeyCodeEnum.TAB) {
      this.closeWithoutFocusRestore();
    }
  }

  /** Closes popover if focus moves outside (Alt+Tab, clicking elsewhere) */
  public onTriggerBlur(): void {
    if (this.isPopoverOpen && this.interactionMode.isKeyboardMode()) {
      setTimeout(() => {
        const activeEl = document.activeElement;
        const triggerEl = this.popoverTrigger?.nativeElement;
        const popoverEl = document.querySelector('ngb-popover-window');

        if (activeEl !== triggerEl && !popoverEl?.contains(activeEl)) {
          this.closeWithoutFocusRestore();
        }
      }, 0);
    }
  }

  public close(): void {
    this.isPopoverOpen = false;
    if (this.isResponsive && this.config.responsiveOffCanvas) {
      this.onOffCanvasClosed();
    } else {
      this.popover?.close();
    }

    this.changeDetector.detectChanges();
  }

  public closeWithoutFocusRestore(): void {
    this.shouldRestoreFocus = false;
    this.close();
  }

  public onMouseLeave(): void {
    if (this.config.triggers !== DsNgbTriggerEvent.HOVER) return;
    this.close();
  }

  public closeButtonClick(): void {
    this.isPopoverOpen = false;
    if (this.isResponsive && this.config.responsiveOffCanvas) {
      this.onOffCanvasClosed();
      return;
    }
    this.close();
  }

  public get isOffCanvasOpen(): boolean {
    return this.isResponsive && !!this.config.responsiveOffCanvas && this.isPopoverOpen;
  }

  public onOffCanvasClosed(): void {
    this.isPopoverOpen = false;
    this.changeDetector.detectChanges();

    if (this.interactionMode.isKeyboardMode() && this.shouldRestoreFocus) {
      this.focusOnTrigger();
    }
    this.shouldRestoreFocus = true;
  }

  public ngOnDestroy(): void {
    if (this.mediaQuery && this.mediaQueryListener) {
      this.mediaQuery.removeEventListener('change', this.mediaQueryListener);
    }
  }

  /** Switches between popover and off-canvas based on viewport breakpoint */
  protected setIsResponsive(): void {
    const breakpoint = this.viewportSizeService.getComponentLayoutBreakpoint('--popover-layout-breakpoint');

    this.mediaQuery = globalThis.matchMedia(`(max-width: ${breakpoint}px)`);
    this.isResponsive = this.mediaQuery.matches;

    this.mediaQueryListener = (event: MediaQueryListEvent): void => {
      this.isResponsive = event.matches;
      this.changeDetector.detectChanges();
    };

    this.mediaQuery.addEventListener('change', this.mediaQueryListener);
  }

  private initDefaultConfiguration(): void {
    this.config = this.mergeConfigsService.mergeConfigs(this.defaultConfig, this.config);
    this.setPopperOptions();

    this.offCanvasConfig = {
      offCanvasHeaderConfig: {
        title: this.config.popoverHeaderConfig.title,
        subtitle: this.config.popoverHeaderConfig.subtitle,
      },
      panelClass: this.config.customClass,
      position: 'bottom',
    };
    this.changeDetector.detectChanges();
  }

  private setPopperOptions(): void {
    const offset = this.config.offset;
    this.popperOptionsFn = (options: Partial<PopperOptions>): Partial<PopperOptions> => {
      if (!offset) {
        return options;
      }
      for (const modifier of (options.modifiers as Array<{ name: string; options?: Record<string, unknown> }>) || []) {
        if (modifier.name === 'offset' && modifier.options) {
          modifier.options['offset'] = (): [number, number] => offset;
        }
      }
      return options;
    };
  }

  private setCloseButtonConfig(config?: Partial<IconButtonConfig>): void {
    this.resolvedCloseButtonConfig = {
      ...config,
      ariaAttributes: {
        ariaLabel: this.translateService.instant('Common.Close'),
      },
      icon: {
        ...config?.icon,
        name: 'cross',
        ariaAttributes: {
          ...config?.icon?.ariaAttributes,
        },
      },
    };
  }

  private focusOnTrigger(): void {
    requestAnimationFrame(() => {
      if (this.popoverTrigger) {
        // focusVisible: true tells the browser this is a keyboard-initiated focus,
        // so :focus-visible is applied and the keyboard-focus-mode outline renders.
        // Cast needed: FocusOptions.focusVisible is not yet in TS lib.dom.d.ts typings.
        this.popoverTrigger.nativeElement.focus({ focusVisible: true } as FocusOptions);
      }
    });
  }
}
