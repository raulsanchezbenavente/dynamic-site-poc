import { Component, EventEmitter, Inject, Input, OnInit, Optional, Output, ViewEncapsulation } from '@angular/core';
import { MergeConfigsService, ModalDialogActionType, PreventMouseFocusDirective } from '@dcx/ui/libs';

import { DsButtonComponent } from '../../../ds-button/ds-button.component';
import { ModalFooterButtonsConfig } from '../../models/modal-footer-buttons.config';
import { MODAL_FOOTER_BUTTONS_CONFIG } from '../../tokens/modal-footer-buttons-default.token';

@Component({
  selector: 'modal-footer-buttons',
  templateUrl: './modal-footer-buttons.component.html',
  styleUrls: ['./styles/modal-footer-buttons.styles.scss'],
  encapsulation: ViewEncapsulation.None,
  host: { class: 'modal-footer-buttons' },
  imports: [DsButtonComponent, PreventMouseFocusDirective],
  standalone: true,
})
export class ModalFooterButtonsComponent implements OnInit {
  @Input({ required: true }) public config!: ModalFooterButtonsConfig;

  @Output()
  protected actionEmitter: EventEmitter<ModalDialogActionType> = new EventEmitter<ModalDialogActionType>();

  constructor(
    private readonly mergeConfigsService: MergeConfigsService,
    @Inject(MODAL_FOOTER_BUTTONS_CONFIG)
    @Optional()
    private readonly defaultConfig: ModalFooterButtonsConfig
  ) {}

  public ngOnInit(): void {
    if (this.defaultConfig) {
      this.initDefaultConfiguration();
    }
  }

  public primaryAction(): void {
    this.actionEmitter.emit(this.config.actionButton?.actionPrimary);
  }

  public secondaryAction(): void {
    this.actionEmitter.emit(this.config.actionButton?.actionSecondary);
  }

  private initDefaultConfiguration(): void {
    this.config = this.mergeConfigsService.mergeConfigs(this.defaultConfig, this.config);
  }
}
