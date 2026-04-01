import { Directive, ElementRef } from '@angular/core';

@Directive({
  selector: '[popoverHeader]',
  host: { class: 'ds-popover-header' },
  standalone: true,
})
export class PopoverHeaderDirective {
  constructor(public elementRef: ElementRef) {}
}
