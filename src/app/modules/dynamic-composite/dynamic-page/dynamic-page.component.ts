import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { SeoService } from '@navigation';

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
type DynamicPageRouteData = {
  components?: PageLayoutRow[];
  path?: string;
  pageName?: string;
  pageId?: string;
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
  private seoSvc = inject(SeoService);

  public ngOnInit(): void {
    this.route.data.subscribe((data) => {
      const routeData = data as DynamicPageRouteData;
      this.rows = Array.isArray(routeData.components) ? routeData.components : [];
      this.titleService.setTitle(String(routeData.pageName ?? ''));
      this.seoSvc.applyPageSeo(routeData.path, routeData.pageName, routeData.seo, routeData.pageId);
    });
  }

  public getInputs(col: PageLayoutCol): Record<string, any> {
    const { component, span, ...inputs } = col;
    return inputs;
  }
}
