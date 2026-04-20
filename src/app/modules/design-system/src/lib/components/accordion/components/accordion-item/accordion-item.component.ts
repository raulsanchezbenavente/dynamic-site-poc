import { Component, input, OnInit, signal } from '@angular/core';
import { collapseAnimationV2, GenerateIdPipe } from '@dcx/ui/libs';

import { AccordionItemConfig } from '../../models/accordion-item.config';
@Component({
  selector: 'accordion-item',
  templateUrl: './accordion-item.component.html',
  styleUrls: ['./styles/accordion-item.styles.scss'],
  host: {
    class: 'ds-accordion-item',
  },
  animations: [collapseAnimationV2],
  imports: [],
  standalone: true,
})
export class AccordionItemComponent implements OnInit {
  public config = input.required<AccordionItemConfig>();
  public collapsed = signal(false);

  constructor(private readonly generateId: GenerateIdPipe) {}

  public ngOnInit(): void {
    this.collapsed.set(!this.config().startOpen);
    const currentConfig = this.config();
    if (!currentConfig.id) {
      currentConfig.id = this.generateId.transform('accordionItemId_');
    }
  }

  /**
   * Toggles the collapsed state of the accordion
   */
  public toggleCollapse(): void {
    this.collapsed.update((value) => !value);
  }
}
