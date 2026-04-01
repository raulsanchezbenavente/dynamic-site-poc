import { NgClass, NgStyle, NgTemplateOutlet } from '@angular/common';
import { Component, computed, inject, input } from '@angular/core';
import { ButtonConfig, ButtonStyles, LayoutSize } from '@dcx/ui/libs';

import { DsButtonComponent } from '../../../ds-button/ds-button.component';
import { GroupOptionsEventService } from '../../services';
import { GroupOptionElementData } from '../models/group-option-element.model';

@Component({
  selector: 'ds-group-options-item',
  templateUrl: './group-options-item.component.html',
  host: {
    class: 'group-options-item',
  },
  imports: [NgClass, NgStyle, NgTemplateOutlet, DsButtonComponent],
  standalone: true,
})
export class DsGroupOptionsItemComponent {
  public data = input.required<GroupOptionElementData>();
  public buttonStyle = input<ButtonStyles>(ButtonStyles.PRIMARY);

  private readonly groupOptionEventService = inject(GroupOptionsEventService);

  /**
   * Button configuration computed from data input
   */
  public readonly buttonConfig = computed<ButtonConfig>(() => ({
    label: this.data().buttonText ?? '',
    layout: {
      style: this.buttonStyle(),
      size: LayoutSize.SMALL,
    },
    link: this.data().link,
  }));

  /**
   * NgClass value for the inner wrapper element
   */
  public readonly innerClasses = computed(() => ({
    'group-options-item_inner--has-image': this.data().image,
    'group-options-item_inner--edge-aligned': this.data().imageEdgeAligned,
  }));

  /**
   * NgStyle value for the inner wrapper element
   */
  public readonly innerStyles = computed(() => this.data().customStyles ?? null);

  public emitEventOnClick(): void {
    this.groupOptionEventService.publishEvent({ optionType: this.data().code ?? '' });
  }
}
