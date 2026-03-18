import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { Meta, Title } from '@angular/platform-browser';

import { SiteConfigService } from '../site-config/site-config.service';
import { SeoService } from './seo.service';

describe('SeoService', () => {
  let service: SeoService;
  let title: Title;
  let meta: Meta;
  let documentRef: Document;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        SeoService,
        {
          provide: SiteConfigService,
          useValue: {
            getPathByPageId: (pageId: string, lang: string) => `/${lang}/page-${pageId}`,
          },
        },
      ],
    });

    service = TestBed.inject(SeoService);
    title = TestBed.inject(Title);
    meta = TestBed.inject(Meta);
    documentRef = TestBed.inject(DOCUMENT);

    documentRef.head.querySelectorAll('link[rel="canonical"], link[rel="alternate"][data-seo-dynamic="true"]').forEach((n) => n.remove());
    documentRef.head.querySelectorAll('meta[name="enable-dynamic-seo"], meta[name="disable-dynamic-seo"]').forEach((n) => n.remove());
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  it('should apply title, meta tags and canonical for indexable page', () => {
    service.applyPageSeo('/en/home', 'Home', { description: 'Desc' }, '0');

    expect(title.getTitle()).toBe('Home');
    expect(meta.getTag('name="description"')?.content).toBe('Desc');
    expect(meta.getTag('name="robots"')?.content).toBe('index,follow');

    const canonical = documentRef.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    expect(canonical?.href).toContain('/en/home');
  });

  it('should force noindex when page is not indexable', () => {
    service.applyPageSeo('/en/private', 'Private', undefined, '999');

    expect(meta.getTag('name="robots"')?.content).toBe('noindex,follow');
  });

  it('should create alternate links including x-default', () => {
    service.applyPageSeo('/es/home', 'Inicio', undefined, '2');

    const alternates = Array.from(
      documentRef.head.querySelectorAll('link[rel="alternate"][data-seo-dynamic="true"]')
    ) as HTMLLinkElement[];

    const hreflangs = alternates.map((link) => link.getAttribute('hreflang'));
    expect(hreflangs).toContain('es');
    expect(hreflangs).toContain('en');
    expect(hreflangs).toContain('fr');
    expect(hreflangs).toContain('pt');
    expect(hreflangs).toContain('x-default');
  });

  it('should skip updates when dynamic seo is disabled via meta', () => {
    const disableMeta = documentRef.createElement('meta');
    disableMeta.setAttribute('name', 'enable-dynamic-seo');
    disableMeta.setAttribute('content', 'false');
    documentRef.head.appendChild(disableMeta);

    title.setTitle('Original');
    service.applyPageSeo('/en/home', 'Changed', { description: 'D' }, '0');

    expect(title.getTitle()).toBe('Original');
  });
});
