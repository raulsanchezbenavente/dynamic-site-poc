import { Directive } from '@angular/core';

@Directive({
  selector: '[panelHeaderAside]',
  host: { class: 'ds-panel-header-aside' },
  standalone: true,
})
export class PanelHeaderAsideDirective {}
