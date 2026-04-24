import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { DsButtonComponent } from '@dcx/ui/design-system';
import {
  ButtonConfig,
  ComposerEvent,
  ComposerEventStatusEnum,
  ComposerEventTypeEnum,
  ComposerService,
  IbeEventRedirectType,
  LoggerService,
  RedirectionService,
} from '@dcx/ui/libs';
import { filter, first } from 'rxjs';

import { ActionType } from './enums/action-type.enum';
import { SubmitButtonRedirectType } from './enums/submit-button-redirect-type.enum';
import { ActionButtonData } from './models/action-button-data.model';

@Component({
  selector: 'submit-button',
  templateUrl: './submit-button.component.html',
  host: { class: 'submit-button' },
  imports: [DsButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class SubmitButtonComponent {
  public readonly config = input.required<ActionButtonData>();
  public buttonConfig = computed<ButtonConfig>(() => this.getButtonConfig());

  private readonly composer = inject(ComposerService);
  private readonly logger = inject(LoggerService);
  private readonly redirectService = inject(RedirectionService);

  /**
   * Create submit request, send submit event, listen submit result and redirect
   */
  public clickAction(): void {
    if (this.config().submitType === ActionType.ALL) {
      // Create list with all components to submit
      const list = this.composer.registerList().map((reg) => {
        return reg.id;
      });
      this.submitAndHandleResult(list, 'Submit All');
    } else if (this.config().submitType === ActionType.LIST) {
      // Create list with specified components to submit
      const list = this.getFilteredRegisteredIds();
      // submit event
      this.composer.submitEvent(list);
      // listen submit event result
      this.submitAndHandleResult(list, 'Submit List');
    } else {
      // Validate Redirect Directly
      this.processRedirect();
    }
  }

  private submitAndHandleResult(list: string[], logMessage: string): void {
    // submit event
    this.composer.submitEvent(list);

    this.composer.notifier$
      .pipe(
        filter((e: ComposerEvent) => e.type === ComposerEventTypeEnum.SubmitFinished),
        first()
      )
      .subscribe((event) => {
        if (event.status === ComposerEventStatusEnum.SUCCESS) {
          this.logger.info('ActionButtonComponent', `${logMessage} - OK`);
          this.processRedirect();
        } else {
          this.logger.info('ActionButtonComponent', `${logMessage} - ERROR`);
        }
      });
  }

  private getFilteredRegisteredIds(): string[] {
    return this.composer
      .registerList()
      .filter((r) => this.config().submitOrder!.includes(r.priority))
      .map((reg) => reg.id);
  }

  private processRedirect(): void {
    if (this.config().redirectType == SubmitButtonRedirectType.EXTERNAL) {
      this.redirectService.redirect(IbeEventRedirectType.externalRedirect, this.config().redirectUrl, '_blank');
    }

    if (this.config().redirectType == SubmitButtonRedirectType.INTERNAL) {
      this.redirectService.redirect(IbeEventRedirectType.internalRedirect, this.config().redirectUrl);
    }
  }

  private getButtonConfig(): ButtonConfig {
    return {
      label: this.config().label,
      layout: this.config().layout,
    };
  }
}
