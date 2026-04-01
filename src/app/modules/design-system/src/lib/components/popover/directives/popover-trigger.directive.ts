import { Directive } from '@angular/core';

@Directive({
  selector: '[popoverTrigger]',
  host: { class: 'ds-popover-trigger' },
  standalone: true,
})
export class PopoverTriggerDirective {}
