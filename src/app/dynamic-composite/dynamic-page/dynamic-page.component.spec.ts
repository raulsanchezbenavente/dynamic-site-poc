import { BehaviorSubject } from 'rxjs';

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';

import { SeoService } from '../../services/seo/seo.service';
import { SiteConfigService } from '../../services/site-config/site-config.service';
import { DynamicPageComponent } from './dynamic-page.component';

describe('DynamicPageComponent', () => {
  let fixture: ComponentFixture<DynamicPageComponent>;
  let component: DynamicPageComponent;
  let siteSubject: BehaviorSubject<{ pages: Array<Record<string, unknown>> }>;
  let titleSpy: jasmine.SpyObj<Title>;
  let seoSpy: jasmine.SpyObj<SeoService>;

  beforeEach(async () => {
    siteSubject = new BehaviorSubject<{ pages: Array<Record<string, unknown>> }>({ pages: [] });
    titleSpy = jasmine.createSpyObj<Title>('Title', ['setTitle']);
    seoSpy = jasmine.createSpyObj<SeoService>('SeoService', ['applyPageSeo']);

    await TestBed.configureTestingModule({
      imports: [DynamicPageComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              routeConfig: { path: 'en/home' },
            },
          },
        },
        { provide: Title, useValue: titleSpy },
        { provide: SeoService, useValue: seoSpy },
        {
          provide: SiteConfigService,
          useValue: {
            site$: siteSubject.asObservable(),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DynamicPageComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should map rows and apply title/seo for matching route path', () => {
    const rows = [{ cols: [{ component: 'header', span: 12 }] }];

    fixture.detectChanges();
    siteSubject.next({
      pages: [
        {
          path: 'en/home',
          name: 'Home',
          pageId: '0',
          layout: { rows },
          seo: { title: 'SEO Home' },
        },
      ],
    });

    expect(component.rows).toEqual(rows);
    expect(titleSpy.setTitle).toHaveBeenCalledWith('Home');
    expect(seoSpy.applyPageSeo).toHaveBeenCalledWith('en/home', 'Home', { title: 'SEO Home' }, '0');
  });

  it('should clear rows when route page does not exist', () => {
    fixture.detectChanges();
    siteSubject.next({ pages: [{ path: 'en/other', layout: { rows: [{ cols: [] }] } }] });

    expect(component.rows).toEqual([]);
  });

  it('should strip component and span from block inputs', () => {
    const result = component.getInputs({ component: 'header', span: 6, title: 't' });
    expect(result).toEqual({ title: 't' });
  });
});
