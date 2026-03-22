import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { SeoService, SiteConfigService, SiteLayoutCol, SiteLayoutRow, SitePage } from '@navigation';

import { BlockOutletComponent } from './block-outlet.component';

@Component({
  selector: 'dynamic-page',
  standalone: true,
  imports: [CommonModule, BlockOutletComponent],
  templateUrl: './dynamic-page.component.html',
})
export class DynamicPageComponent implements OnInit {
  public rows: SiteLayoutRow[] = [];

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

  public getInputs(col: SiteLayoutCol): Record<string, unknown> {
    const { component, span, ...inputs } = col;
    return inputs;
  }
}
