import { Directive } from '@angular/core';

@Directive({
  selector: '[panelFooter]',
  host: { class: 'ds-panel-footer' },
  standalone: true,
})
export class PanelFooterDirective {}
