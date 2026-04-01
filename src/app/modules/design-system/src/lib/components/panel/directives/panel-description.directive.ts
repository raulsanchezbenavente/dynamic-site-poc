import { Directive } from '@angular/core';

@Directive({
  selector: '[panelDescription]',
  host: { class: 'ds-panel-description' },
  standalone: true,
})
export class PanelDescriptionDirective {}
