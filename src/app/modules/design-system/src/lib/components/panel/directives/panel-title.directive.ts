import { Directive, ElementRef, inject } from '@angular/core';

@Directive({
  selector: '[panelTitle]',
  host: { class: 'ds-panel-title' },
  standalone: true,
})
export class PanelTitleDirective {
  public readonly elementRef = inject(ElementRef);
}
