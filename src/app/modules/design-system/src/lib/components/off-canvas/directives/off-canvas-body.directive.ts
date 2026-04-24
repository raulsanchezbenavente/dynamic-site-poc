import { Directive } from '@angular/core';

@Directive({
  selector: '[offCanvasBody]',
  host: { class: 'ds-off-canvas-body' },
  standalone: true,
})
export class OffCanvasBodyDirective {}
