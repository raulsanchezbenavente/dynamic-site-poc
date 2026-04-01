import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';

import { AccessibleLinkDirective } from './accessible-link.directive';
import { TranslateService } from '@ngx-translate/core';
import { ExternalLinkPipe } from '../pipes/external-link.pipe';
import { LinkModel, LinkTarget } from '../model/link.model';

class TranslateServiceMock {
  translations: Record<string, string> = {};

  stream(key: string) {
    const value = this.translations[key] ?? key;
    return of(value);
  }
}

class ExternalLinkPipeMock {
  transform(url: string): boolean {
    return /^https?:\/\//.test(url);
  }
}

@Component({
  standalone: true,
  imports: [AccessibleLinkDirective],
  template: `
    <a
      accessibleLink
      [link]="link"
      [skipRel]="skipRel"
      [showIcon]="showIcon"
    >
      {{ link?.title }}
    </a>
  `,
})
class TestHostComponent {
  link!: LinkModel;
  skipRel = false;
  showIcon = true;
}

describe('AccessibleLinkDirective', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let translate: TranslateServiceMock;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent], // Host standalone
      providers: [
        { provide: TranslateService, useClass: TranslateServiceMock },
        { provide: ExternalLinkPipe, useClass: ExternalLinkPipeMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    translate = TestBed.inject(TranslateService) as any;

    translate.translations = {
      'Common.A11y.ExternalLink': 'external link',
      'Common.A11y.OpenNewWindow': 'opens in a new window',
    };
  });

  function render(
    link: LinkModel,
    opts: { skipRel?: boolean; showIcon?: boolean } = {}
  ): HTMLAnchorElement {
    fixture.componentInstance.link = link;
    if (opts.skipRel !== undefined) {
      fixture.componentInstance.skipRel = opts.skipRel;
    }
    if (opts.showIcon !== undefined) {
      fixture.componentInstance.showIcon = opts.showIcon;
    }

    fixture.detectChanges();

    const de = fixture.debugElement.query(
      By.directive(AccessibleLinkDirective)
    );
    expect(de).withContext('AccessibleLinkDirective not found on <a>').not.toBeNull();

    return de!.nativeElement as HTMLAnchorElement;
  }

  it('should set href, target, rel and aria-label for external _blank links with icon', () => {
    const anchor = render(
      {
        title: 'Open external',
        url: 'https://external.com',
        target: LinkTarget.BLANK,
      },
      { showIcon: true }
    );

    expect(anchor.getAttribute('href')).toBe('https://external.com');
    expect(anchor.getAttribute('target')).toBe('_blank');

    const rel = anchor.getAttribute('rel') || '';
    expect(rel).toContain('noopener');
    expect(rel).toContain('noreferrer');

    expect(anchor.classList).toContain('link--target-blank');

    const aria = anchor.getAttribute('aria-label')!;
    expect(aria).toContain('Open external');          // base text
    expect(aria).toContain('external link');          // from translation
    expect(aria).toContain('opens in a new window');  // from translation
  });

  it('should not add target-blank class when showIcon is false', () => {
    const anchor = render(
      {
        title: 'No icon',
        url: 'https://external.com',
        target: LinkTarget.BLANK,
      },
      { showIcon: false }
    );

    expect(anchor.classList).not.toContain('link--target-blank');
  });

  it('should not override existing aria-label', () => {
    const anchor = render({
      title: 'Has label',
      url: 'https://external.com',
      target: LinkTarget.BLANK,
    });

    anchor.setAttribute('aria-label', 'Already set');
    fixture.detectChanges();

    expect(anchor.getAttribute('aria-label')).toBe('Already set');
  });

  it('should not set aria-label if translations are unresolved (keys returned as-is)', () => {
    translate.translations = {};

    const anchor = render({
      title: 'No translations yet',
      url: 'https://external.com',
      target: LinkTarget.BLANK,
    });

    expect(anchor.hasAttribute('aria-label')).toBeFalse();
  });

  it('should use href as base text if no title or text content', () => {
    const anchor = render({
      url: 'https://external.com/base',
      target: LinkTarget.BLANK,
    } as LinkModel);

    const aria = anchor.getAttribute('aria-label')!;
    expect(aria).toContain(anchor.href);
  });
});
