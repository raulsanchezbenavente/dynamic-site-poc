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

    expect(component.rows.length).toBe(1);
    expect(component.rows[0]?.cols.length).toBe(1);
    expect(component.rows[0]?.cols[0]?.['component']).toBe('header');
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

  it('should log once when all mapped components are ready', () => {
    const consoleLogSpy = spyOn(console, 'log');

    fixture.detectChanges();
    routeDataSubject.next({
      pageId: 'rte-page',
      components: [
        {
          cols: [
            {
              component: 'RTEinjector_uiplus',
              htmlContentURLs: ['/assets/rte-fragments/allowed-cabin/en'],
            },
            {
              component: 'RTEinjector_uiplus',
              htmlContentURLs: ['/assets/rte-fragments/allowed-cellar/en'],
            },
          ],
        },
      ],
    });

    const firstBlock = component.rows[0]?.cols[0] as Record<string, unknown>;
    const secondBlock = component.rows[0]?.cols[1] as Record<string, unknown>;
    const batchId = String(firstBlock?.['__dynamicPageBatchId'] ?? '');

    document.dispatchEvent(
      new CustomEvent('dynamic-page:component-ready', {
        detail: {
          batchId,
          componentId: String(firstBlock?.['__dynamicPageComponentId'] ?? ''),
          component: 'RTEinjector_uiplus',
          state: 'loaded',
        },
      })
    );

    expect(consoleLogSpy).not.toHaveBeenCalledWith(
      '[dynamic-page] all mapped components ready',
      jasmine.any(Object)
    );

    document.dispatchEvent(
      new CustomEvent('dynamic-page:component-ready', {
        detail: {
          batchId,
          componentId: String(secondBlock?.['__dynamicPageComponentId'] ?? ''),
          component: 'RTEinjector_uiplus',
          state: 'loaded',
        },
      })
    );

    expect(consoleLogSpy).toHaveBeenCalledTimes(1);
    expect(consoleLogSpy).toHaveBeenCalledWith(
      '[dynamic-page] all mapped components ready',
      jasmine.objectContaining({
        pageId: 'rte-page',
        expected: 2,
        completed: 2,
      })
    );
  });

  it('should wait for nested tab components before finalizing page readiness', () => {
    const consoleLogSpy = spyOn(console, 'log');

    fixture.detectChanges();
    routeDataSubject.next({
      pageId: 'tabs-page',
      components: [
        {
          cols: [
            {
              component: 'multiTabBlock_uiplus',
              config: {
                tabs: [
                  {
                    tabId: 'a',
                    name: 'A',
                    title: 'A',
                    layout: {
                      rows: [
                        {
                          cols: [{ component: 'RTEinjector_uiplus' }],
                        },
                      ],
                    },
                  },
                  {
                    tabId: 'b',
                    name: 'B',
                    title: 'B',
                    layout: {
                      rows: [
                        {
                          cols: [{ component: 'mainHeader_uiplus' }],
                        },
                      ],
                    },
                  },
                ],
              },
            },
          ],
        },
      ],
    });

    const tabsBlock = component.rows[0]?.cols[0] as Record<string, unknown>;
    const tabsConfig = (tabsBlock?.['config'] as Record<string, unknown> | undefined) ?? {};
    const trackedTabs = (tabsConfig['tabs'] as Array<Record<string, unknown>>) ?? [];
    const firstTabLayout = trackedTabs[0]?.['layout'] as { rows?: Array<{ cols?: Record<string, unknown>[] }> };
    const secondTabLayout = trackedTabs[1]?.['layout'] as { rows?: Array<{ cols?: Record<string, unknown>[] }> };
    const firstNestedBlock = firstTabLayout?.rows?.[0]?.cols?.[0] as Record<string, unknown>;
    const secondNestedBlock = secondTabLayout?.rows?.[0]?.cols?.[0] as Record<string, unknown>;

    const batchId = String(firstNestedBlock?.['__dynamicPageBatchId'] ?? '');
    const firstNestedComponentId = String(firstNestedBlock?.['__dynamicPageComponentId'] ?? '');
    const secondNestedComponentId = String(secondNestedBlock?.['__dynamicPageComponentId'] ?? '');

    expect(batchId.length).toBeGreaterThan(0);
    expect(firstNestedComponentId.length).toBeGreaterThan(0);
    expect(secondNestedComponentId.length).toBeGreaterThan(0);

    // Event from tabs wrapper must be ignored because tabs itself is not tracked as a leaf component.
    document.dispatchEvent(
      new CustomEvent('dynamic-page:component-ready', {
        detail: {
          batchId,
          componentId: 'tabs-wrapper',
          component: 'multiTabBlock_uiplus',
          state: 'rendered',
        },
      })
    );

    expect(consoleLogSpy).not.toHaveBeenCalledWith(
      '[dynamic-page] all mapped components ready',
      jasmine.any(Object)
    );

    document.dispatchEvent(
      new CustomEvent('dynamic-page:component-ready', {
        detail: {
          batchId,
          componentId: firstNestedComponentId,
          component: 'RTEinjector_uiplus',
          state: 'loaded',
        },
      })
    );

    expect(consoleLogSpy).not.toHaveBeenCalledWith(
      '[dynamic-page] all mapped components ready',
      jasmine.any(Object)
    );

    document.dispatchEvent(
      new CustomEvent('dynamic-page:component-ready', {
        detail: {
          batchId,
          componentId: secondNestedComponentId,
          component: 'mainHeader_uiplus',
          state: 'loaded',
        },
      })
    );

    expect(consoleLogSpy).toHaveBeenCalledTimes(1);
    expect(consoleLogSpy).toHaveBeenCalledWith(
      '[dynamic-page] all mapped components ready',
      jasmine.objectContaining({
        pageId: 'tabs-page',
        expected: 2,
        completed: 2,
      })
    );
  });

});
