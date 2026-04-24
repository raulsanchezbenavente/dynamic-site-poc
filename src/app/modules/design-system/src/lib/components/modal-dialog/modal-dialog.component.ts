/**
 * ModalDialogComponent
 *
 * This component serves as a foundational base for displaying a modal dialog.
 * It supports projecting content inside the modal and reacting to action buttons,
 * such as confirm or cancel. It is intended to be used as a container or base component
 * for creating modals, allowing additional components to be projected into its `ng-content`.
 *
 * This component is typically used in conjunction with the `ModalDialogService`
 * to handle modal lifecycle management.
 */

import {
  AfterContentInit,
  Component,
  ContentChild,
  EventEmitter,
  HostBinding,
  Inject,
  Input,
  NgZone,
  OnDestroy,
  OnInit,
  Optional,
  Output,
  Renderer2,
  ViewEncapsulation,
} from '@angular/core';
import {
  CommonTranslationKeys,
  EventBusService,
  IbeEventTypeEnum,
  MergeConfigsService,
  ModalClosedEvent,
  ModalDialogActionType,
} from '@dcx/ui/libs';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';

import { AlertPanelComponent } from '../alert-panel/alert-panel.component';
import { IconComponent } from '../icon/icon.component';

import { ModalFooterButtonsComponent } from './components/modal-footer-buttons/modal-footer-buttons.component';
import { ModalFooterContentDirective } from './directives/modal-footer-content.directive';
import { ModalDialogConfig } from './models/modal-dialog.config';
import { MODAL_DIALOG_CONFIG } from './tokens/modal-dialog-default-config.token';

@Component({
  selector: 'ds-modal-dialog',
  templateUrl: './modal-dialog.component.html',
  styleUrl: './styles/modal-dialog.styles.scss',
  encapsulation: ViewEncapsulation.None,
  host: {
    class: 'ds-modal-dialog',
  },
  imports: [TranslateModule, IconComponent, AlertPanelComponent, ModalFooterButtonsComponent],
  standalone: true,
})
export class ModalDialogComponent implements OnInit, AfterContentInit, OnDestroy {
  @Input({ required: true }) public modalDialogConfig!: ModalDialogConfig;
  @Output() public closeModal = new EventEmitter<void>();
  private cleanupMousedownListener?: () => void;
  /**
   * Event emitter to propagate actions from the modal, such as confirm or cancel.
   */
  @Output() public actionEmitter = new EventEmitter<ModalDialogActionType>();

  /**
   * Reference to the modal instance. Managed by the parent service.
   */
  public modalRef!: NgbModalRef;
  /**
   * Reference to the action types for modal dialogs (e.g., confirm, cancel).
   */
  public modalDialogActionType = ModalDialogActionType;

  /**
   * Detects if custom footer content is projected using the modalFooter directive
   */
  @ContentChild(ModalFooterContentDirective) protected customFooter?: ModalFooterContentDirective;
  protected hasCustomFooter = false;

  protected readonly CommonTranslationKeys = CommonTranslationKeys;

  @HostBinding('attr.tabindex')
  private get tabindex(): string | null {
    return this.modalDialogConfig?.programmaticOpen ? '-1' : null;
  }

  /**
   * Controls autofocus behavior based on how the modal was opened.
   * When programmaticOpen is true (opened via ModalDialogService), we enable autofocus
   * to prevent the focus outline from appearing on the modal container itself.
   * This ensures a cleaner UI when modals are triggered automatically without user interaction.
   */
  @HostBinding('attr.ngbAutofocus')
  private get ngbAutofocus(): string | null {
    return this.modalDialogConfig?.programmaticOpen ? '' : null;
  }

  private setupBackdropMousedownListener(): void {
    this.ngZone.runOutsideAngular(() => {
      this.cleanupMousedownListener = this.renderer.listen('document', 'mousedown', (event: MouseEvent) => {
        const target = event.target as HTMLElement;
        /* ng-bootstrap overlay container classes */
        if (target?.classList.contains('modal') || target?.classList.contains('modal-backdrop')) {
          event.preventDefault();
        }
      });
    });
  }

  /**
   * Determines if the footer should be displayed
   */
  protected get shouldShowFooter(): boolean {
    return this.hasCustomFooter || this.hasFooterButtons;
  }

  /**
   * Checks if footer buttons configuration exists and is visible
   */
  protected get hasFooterButtons(): boolean {
    return !!this.modalDialogConfig.footerButtonsConfig?.isVisible;
  }

  /**
   * Checks if there are actual buttons to render
   */
  protected get hasButtonsToRender(): boolean {
    const config = this.modalDialogConfig.footerButtonsConfig;
    return !!(config?.isVisible && (config.actionButton || config.secondaryButton));
  }

  constructor(
    @Optional()
    @Inject(MODAL_DIALOG_CONFIG)
    private readonly defaultConfig: ModalDialogConfig,
    private readonly mergeConfigsService: MergeConfigsService,
    private readonly eventBusService: EventBusService,
    private readonly ngZone: NgZone,
    private readonly renderer: Renderer2
  ) {}

  public ngOnInit(): void {
    this.initDefaultConfiguration();
    this.setupBackdropMousedownListener();
  }

  public ngAfterContentInit(): void {
    this.hasCustomFooter = !!this.customFooter;
  }

  public ngOnDestroy(): void {
    if (this.cleanupMousedownListener) {
      this.cleanupMousedownListener();
    }
  }

  protected close(action: ModalDialogActionType = ModalDialogActionType.CLOSE): void {
    const event: ModalClosedEvent = {
      type: IbeEventTypeEnum.modalClosed,
      payload: {
        actionType: action,
      },
    };
    this.eventBusService.notifyEvent(event);
    this.closeModal.emit();
  }

  /**
   * Emits actions from the modal could be use to suscribe to cancel or complete action.
   */
  protected handleAction(action: ModalDialogActionType): void {
    this.actionEmitter.emit(action);
    this.close(action);
  }

  private initDefaultConfiguration(): void {
    this.modalDialogConfig = this.mergeConfigsService.mergeConfigs(this.defaultConfig, this.modalDialogConfig);
  }
}
