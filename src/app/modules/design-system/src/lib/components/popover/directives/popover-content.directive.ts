import { Directive } from '@angular/core';

@Directive({
  selector: '[popoverContent]',
  host: { class: 'ds-popover-content' },
  standalone: true,
})
export class PopoverContentDirective {}
