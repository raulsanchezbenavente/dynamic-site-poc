import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';

import { SeoService } from '../../services/seo/seo.service';
import { SiteConfigService } from '../../services/site-config/site-config.service';

import { BlockOutletComponent } from './block-outlet.component';

type PageLayoutCol = {
  component: string;
  span?: number;
  tabs?: any[];
  config?: any;
  [key: string]: any;
};
type PageLayoutRow = { cols: PageLayoutCol[] };
type SeoConfig = {
  title?: string;
  description?: string;
  robots?: string;
  canonical?: string;
};
type SitePage = {
  pageId?: string;
  path?: string;
  name?: string;
  layout?: { rows?: PageLayoutRow[] } | PageLayoutRow[];
  seo?: SeoConfig;
};

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
  private seoSvc = inject(SeoService);

  public ngOnInit(): void {
    const path = this.route.snapshot.routeConfig?.path;

    this.siteSvc.site$.subscribe((site) => {
      const pages = Array.isArray(site?.pages) ? (site.pages as SitePage[]) : [];
      const page = pages.find((p) => p.path === path);

      if (page) {
        const layout = page.layout;
        const rows = Array.isArray(layout) ? layout : layout?.rows;
        this.rows = Array.isArray(rows) ? rows : [];
        this.titleService.setTitle(String(page.name ?? ''));
        this.seoSvc.applyPageSeo(page.path, page.name, page.seo, page.pageId);
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
