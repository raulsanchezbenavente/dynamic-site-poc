import { BehaviorSubject } from 'rxjs';

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';

import { SeoService } from '@navigation';
import { DynamicPageComponent } from './dynamic-page.component';

describe('DynamicPageComponent', () => {
  let fixture: ComponentFixture<DynamicPageComponent>;
  let component: DynamicPageComponent;
  let routeDataSubject: BehaviorSubject<Record<string, unknown>>;
  let titleSpy: jasmine.SpyObj<Title>;
  let seoSpy: jasmine.SpyObj<SeoService>;

  beforeEach(async () => {
    routeDataSubject = new BehaviorSubject<Record<string, unknown>>({});
    titleSpy = jasmine.createSpyObj<Title>('Title', ['setTitle']);
    seoSpy = jasmine.createSpyObj<SeoService>('SeoService', ['applyPageSeo']);

    await TestBed.configureTestingModule({
      imports: [DynamicPageComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            data: routeDataSubject.asObservable(),
          },
        },
        { provide: Title, useValue: titleSpy },
        { provide: SeoService, useValue: seoSpy },
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
    routeDataSubject.next({
      path: 'en/home',
      pageName: 'Home',
      pageId: '0',
      components: rows,
      seo: { title: 'SEO Home' },
    });

    expect(component.rows).toEqual(rows);
    expect(titleSpy.setTitle).toHaveBeenCalledWith('Home');
    expect(seoSpy.applyPageSeo).toHaveBeenCalledWith('en/home', 'Home', { title: 'SEO Home' }, '0');
  });

  it('should clear rows when route page does not exist', () => {
    fixture.detectChanges();
    routeDataSubject.next({});

    expect(component.rows).toEqual([]);
  });

  it('should strip component and span from block inputs', () => {
    const result = component.getInputs({ component: 'header', span: 6, title: 't' });
    expect(result).toEqual({ title: 't' });
  });

  it('should refresh rte block config on same pageId updates', () => {
    const enRows = [
      {
        cols: [
          {
            component: 'RTEinjector_uiplus',
            htmlContentURLs: ['/assets/rte-fragments/allowed-cabin/en'],
          },
        ],
      },
    ];
    const esRows = [
      {
        cols: [
          {
            component: 'RTEinjector_uiplus',
            htmlContentURLs: ['/assets/rte-fragments/allowed-cabin/es'],
          },
        ],
      },
    ];

    fixture.detectChanges();
    routeDataSubject.next({ pageId: '0', components: enRows });

    const originalRowRef = component.rows[0];

    routeDataSubject.next({ pageId: '0', components: esRows });

    expect(component.rows[0]).not.toBe(originalRowRef);
    expect(component.rows[0]?.cols[0]?.['htmlContentURLs']).toEqual(['/assets/rte-fragments/allowed-cabin/es']);
  });

  it('should preserve non-localized blocks on same pageId updates', () => {
    const firstRows = [
      {
        cols: [{ component: 'mainHeader_uiplus', title: 'EN title' }],
      },
    ];
    const secondRows = [
      {
        cols: [{ component: 'mainHeader_uiplus', title: 'ES title' }],
      },
    ];

    fixture.detectChanges();
    routeDataSubject.next({ pageId: '0', components: firstRows });

    const originalRowRef = component.rows[0];
    const originalColRef = component.rows[0]?.cols[0];

    routeDataSubject.next({ pageId: '0', components: secondRows });

    expect(component.rows[0]).toBe(originalRowRef);
    expect(component.rows[0]?.cols[0]).toBe(originalColRef);
    expect(component.rows[0]?.cols[0]?.['title']).toBe('EN title');
  });
});
