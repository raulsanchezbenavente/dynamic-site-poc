// layout-slot.directive.ts
import { Directive, Input, TemplateRef } from '@angular/core';

@Directive({
  selector: '[layoutSlot]',
  standalone: true,
})
export class LayoutSlotDirective {
  @Input('layoutSlot') public slotName!: string;

  constructor(public templateRef: TemplateRef<unknown>) {}
}
