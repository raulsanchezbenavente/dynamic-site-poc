import { Directive } from '@angular/core';

@Directive({
  selector: '[panelIcon]',
  host: { class: 'ds-panel-icon' },
  standalone: true,
})
export class PanelIconDirective {}
