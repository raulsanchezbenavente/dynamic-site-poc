import { Directive, input } from '@angular/core';

@Directive({
  selector: '[layoutSlot]',
  standalone: true,
})
export class LayoutSlotDirective {
  public layoutSlot = input<string>('');
}
