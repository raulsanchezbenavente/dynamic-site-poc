import { Component } from '@angular/core';

@Component({
  selector: 'ds-form-blocker',
  standalone: true,
  template: '',
  styles: [
    `
      :host {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(255, 255, 255, 0.6);
        z-index: 10;
        pointer-events: all;
      }
    `,
  ],
})
export class DsFormBlockerComponent {}
