import { Component } from '@angular/core';

@Component({
  selector: 'ds-layout-swapper',
  standalone: true,
  template: `<ng-content></ng-content>`,
})
export class DsLayoutSwapperComponent {
  public showProjection(_view: string): void {}
}
