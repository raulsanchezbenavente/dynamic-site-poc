import type { OnDestroy, OnInit } from '@angular/core';
import { Component, Input, TemplateRef, ViewChild } from '@angular/core';
import { DEFAULT_CONFIG_MODAL_DIALOG, ModalDialogService } from '@dcx/storybook/design-system';
import type { ModalDialogConfig } from '@dcx/storybook/design-system';
import { ModalDialogActionType } from '@dcx/ui/libs';
import { Subject, takeUntil } from 'rxjs';

import { ModalFooterContentDirective } from '../../directives/modal-footer-content.directive';
import { ModalDialogComponent } from '../../modal-dialog.component';

@Component({
  selector: 'storybook-dialog-wrapper',
  template: `
    <button (click)="openModal()">Open Dialog</button>

    <ng-template #modalTemplate>
      <ds-modal-dialog
        [modalDialogConfig]="config"
        (closeModal)="onClose()"
        (actionEmitter)="onAction($event)">
        <ng-content></ng-content>
      </ds-modal-dialog>
    </ng-template>
  `,
  providers: [ModalDialogService],
  imports: [ModalDialogComponent],
  standalone: true,
})
export class StorybookDialogWrapperComponent implements OnInit {
  @Input() public config!: ModalDialogConfig;
  @Input() public customComponent?: unknown;
  @Input() public useTemplate = false;

  @ViewChild('modalTemplate', { static: false }) public modalTemplate?: TemplateRef<unknown>;

  private readonly $unsubscribe: Subject<void> = new Subject<void>();

  constructor(private readonly dialogService: ModalDialogService) {}

  public ngOnInit(): void {
    this.config = { ...DEFAULT_CONFIG_MODAL_DIALOG, ...this.config };
  }

  public openModal(): void {
    type ModalContent = TemplateRef<unknown> | string | typeof ModalDialogComponent;

    let modalContent: ModalContent;

    if (this.useTemplate && this.modalTemplate) {
      modalContent = this.modalTemplate;
    } else if (typeof this.customComponent === 'string') {
      modalContent = this.customComponent;
    } else {
      // fallback to the default component
      modalContent = ModalDialogComponent;
    }

    this.dialogService.openModal(this.config, modalContent).pipe(takeUntil(this.$unsubscribe)).subscribe();
  }

  public onClose(): void {
    this.dialogService.closeActiveModal();
  }

  public onAction(action: ModalDialogActionType): void {
    console.log('Action:', action);
  }
}

@Component({
  selector: 'storybook-large-size-footer-content',
  template: `
    <button
      class="storybook-trigger"
      type="button"
      (click)="openModal()">
      Open Services Modal
    </button>

    <ng-template #largeSizeFooterContentTemplate>
      <ds-modal-dialog
        [modalDialogConfig]="modalDialogConfig"
        (closeModal)="closeModal()"
        (actionEmitter)="onAction($event)">
        <div
          modalFooterContent
          class="storybook-modal-footer-content">
          <div class="storybook-modal-footer-content_summary">
            <span>Total to pay</span>
            <strong>$ 128.90</strong>
          </div>

          <div class="storybook-modal-footer-content_actions">
            <button
              class="storybook-modal-footer-content_secondary"
              type="button"
              (click)="emitCancel()">
              Cancel
            </button>
            <button
              class="storybook-modal-footer-content_primary"
              type="button"
              (click)="emitConfirm()">
              Confirm
            </button>
          </div>
        </div>
      </ds-modal-dialog>
    </ng-template>
  `,
  styles: [
    `
      .storybook-trigger {
        padding: 0.75rem 1.5rem;
        border-radius: 999px;
        border: none;
        background: #111827;
        color: #fff;
        cursor: pointer;
      }

      .storybook-modal-footer-content {
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }

      .storybook-modal-footer-content_summary {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        font-size: 0.95rem;
      }

      .storybook-modal-footer-content_summary strong {
        font-size: 1.25rem;
        margin-left: 0.5rem;
      }

      .storybook-modal-footer-content_actions {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.5rem;
      }

      .storybook-modal-footer-content_primary,
      .storybook-modal-footer-content_secondary {
        padding: 0.75rem 1rem;
        border-radius: 999px;
        border: none;
        cursor: pointer;
        font-weight: 600;
      }

      .storybook-modal-footer-content_primary {
        background: #1b1b1b;
        color: #fff;
      }

      .storybook-modal-footer-content_secondary {
        background: transparent;
        color: #177f8c;
        text-decoration: underline;
      }
    `,
  ],
  standalone: true,
  imports: [ModalDialogComponent, ModalFooterContentDirective],
  providers: [ModalDialogService],
})
export class StorybookServicesFooterDemoComponent implements OnDestroy {
  @Input() public modalDialogConfig!: ModalDialogConfig;

  @ViewChild('largeSizeFooterContentTemplate', { read: TemplateRef })
  public largeSizeFooterContentTemplate?: TemplateRef<unknown>;

  protected readonly modalDialogActionType = ModalDialogActionType;

  private readonly $destroyed: Subject<void> = new Subject<void>();

  constructor(private readonly modalDialogService: ModalDialogService) {}

  public openModal(): void {
    if (!this.largeSizeFooterContentTemplate) {
      return;
    }

    this.modalDialogService
      .openModal(this.modalDialogConfig, this.largeSizeFooterContentTemplate)
      .pipe(takeUntil(this.$destroyed))
      .subscribe();
  }

  public closeModal(): void {
    this.modalDialogService.closeActiveModal();
  }

  public onAction(action: ModalDialogActionType): void {
    console.log('[storybook-large-size-footer-content] modal action:', action);
  }

  public emitConfirm(): void {
    this.modalDialogService.closeActiveModal();
    this.onAction(ModalDialogActionType.CONFIRM);
  }

  public emitCancel(): void {
    this.modalDialogService.closeActiveModal();
    this.onAction(ModalDialogActionType.CANCEL);
  }

  public ngOnDestroy(): void {
    this.$destroyed.next();
    this.$destroyed.complete();
  }
}
