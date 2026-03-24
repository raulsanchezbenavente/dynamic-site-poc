import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { RouterInitService } from './router-init/router-init.service';

@Component({
  selector: 'app-root',
  standalone: true,
  template: '<router-outlet></router-outlet>',
  imports: [RouterOutlet],
})
export class AppComponent {
  private readonly routerInitService = inject(RouterInitService);

  constructor() {
    this.routerInitService.init();
  }
}
