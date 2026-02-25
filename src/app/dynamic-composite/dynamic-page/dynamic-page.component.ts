import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';

import { SiteConfigService } from '../../services/site-config/site-config.service';
import { BlockOutletComponent } from '../block-outlet/block-outlet.component';

type PageLayoutCol = {
  component: string;
  span?: number;
  tabs?: any[];
  config?: any;
  [key: string]: any;
};
type PageLayoutRow = { cols: PageLayoutCol[] };

@Component({
  selector: 'dynamic-page',
  standalone: true,
  imports: [CommonModule, BlockOutletComponent],
  templateUrl: './dynamic-page.component.html',
})
export class DynamicPageComponent implements OnInit {
  public rows: PageLayoutRow[] = [];

  private route = inject(ActivatedRoute);
  private titleService = inject(Title);
  private siteSvc = inject(SiteConfigService);

  public ngOnInit(): void {
    const path = this.route.snapshot.routeConfig?.path;

    this.siteSvc.site$.subscribe((site) => {
      const page = site?.pages?.find((p: any) => p.path === path);

      if (page) {
        const rows = page.layout?.rows ?? page.layout;
        this.rows = Array.isArray(rows) ? rows : [];
        this.titleService.setTitle(page.name);
      } else {
        this.rows = [];
      }
    });
  }

  public getInputs(col: PageLayoutCol): Record<string, any> {
    const { component, span, ...inputs } = col;
    return inputs;
  }
}
