import { Directive } from '@angular/core';

@Directive({
  selector: '[panelContent]',
  host: { class: 'ds-panel-content' },
  standalone: true,
})
export class PanelContentDirective {}
