import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { RouterInitService } from './router-init/router-init.service';
import { InitialConfigService } from './services/initial-config.service';

@Component({
  selector: 'app-root',
  standalone: true,
  template: '<router-outlet></router-outlet>',
  imports: [RouterOutlet],
})
export class AppComponent {
  private readonly routerInitService = inject(RouterInitService);
  private readonly initialConfigService = inject(InitialConfigService);

  constructor() {
    this.routerInitService.init();
    this.initialConfigService.initialize();
  }
}
