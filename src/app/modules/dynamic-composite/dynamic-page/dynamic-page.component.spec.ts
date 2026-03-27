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
});
