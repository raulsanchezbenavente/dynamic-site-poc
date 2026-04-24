import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DsTitleHeadingComponent } from './title-heading.component';
import { TitleHeading } from './enums/title-heading.enum';
import { TitleHeadingConfig } from './models/title-heading.model';
import { HorizontalAlign } from '@dcx/ui/libs';

describe('DsTitleHeadingComponent', () => {
  let fixture: ComponentFixture<DsTitleHeadingComponent>;
  let element: HTMLElement;

  const DEFAULT_CONFIG: TitleHeadingConfig = { title: 'Hello World' };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DsTitleHeadingComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DsTitleHeadingComponent);
    element = fixture.nativeElement;
  });

  // ── helpers ──────────────────────────────────────────────
  function setConfig(cfg: TitleHeadingConfig): void {
    fixture.componentRef.setInput('config', cfg);
    TestBed.flushEffects();
    fixture.detectChanges();
  }

  function heading(tag: string): HTMLElement | null {
    return element.querySelector(tag);
  }

  // ── 1. Rendering with defaults ──────────────────────────
  describe('rendering with defaults', () => {
    it('should render an <h2> when no htmlTag is specified', () => {
      setConfig(DEFAULT_CONFIG);
      expect(heading('h2')).toBeTruthy();
      expect(heading('h2')!.textContent!.trim()).toBe('Hello World');
    });

    it('should apply default alignment class (center) on host', () => {
      setConfig(DEFAULT_CONFIG);
      expect(element.classList).toContain('title-heading--align-center');
    });

    it('should apply default styleClass (h1) via context class', () => {
      setConfig(DEFAULT_CONFIG);
      const h2 = heading('h2')!;
      expect(h2.classList).toContain('title-heading_title');
      expect(h2.classList).toContain('context-h1');
    });

    it('should NOT render intro-text div when introText is absent', () => {
      setConfig(DEFAULT_CONFIG);
      expect(element.querySelector('.title-heading_intro-text')).toBeNull();
    });
  });

  // ── 2. HTML tag switching (@switch) ─────────────────────
  describe('htmlTag switching', () => {
    const tags: TitleHeading[] = [
      TitleHeading.H1,
      TitleHeading.H2,
      TitleHeading.H3,
      TitleHeading.H4,
      TitleHeading.H5,
      TitleHeading.H6,
    ];

    tags.forEach((tag) => {
      it(`should render <${tag}> when htmlTag is '${tag}'`, () => {
        setConfig({ title: 'Tag Test', htmlTag: tag });
        expect(heading(tag)).toBeTruthy();
        expect(heading(tag)!.textContent!.trim()).toBe('Tag Test');
      });
    });

    it('should fall back to <h2> for an invalid htmlTag value', () => {
      setConfig({ title: 'Fallback', htmlTag: 'h99' as unknown as TitleHeading });
      expect(heading('h2')).toBeTruthy();
    });
  });

  // ── 3. Style class variants ─────────────────────────────
  describe('styleClass variants', () => {
    it('should apply custom styleClass as context-{value}', () => {
      setConfig({ title: 'Styled', styleClass: TitleHeading.H3 });
      const h2 = heading('h2')!;
      expect(h2.classList).toContain('context-h3');
    });
  });

  // ── 4. Horizontal alignment ─────────────────────────────
  describe('horizontal alignment', () => {
    [HorizontalAlign.LEFT, HorizontalAlign.CENTER, HorizontalAlign.RIGHT].forEach((align) => {
      it(`should set host class title-heading--align-${align}`, () => {
        setConfig({ title: 'Align', horizontalAlignment: align });
        expect(element.classList).toContain(`title-heading--align-${align}`);
      });
    });
  });

  // ── 5. Visually hidden ──────────────────────────────────
  describe('isVisuallyHidden', () => {
    it('should add hide-visually class when true', () => {
      setConfig({ title: 'Hidden', isVisuallyHidden: true });
      expect(heading('h2')!.classList).toContain('hide-visually');
    });

    it('should NOT add hide-visually class when false', () => {
      setConfig({ title: 'Visible', isVisuallyHidden: false });
      expect(heading('h2')!.classList).not.toContain('hide-visually');
    });
  });

  // ── 6. Intro text (@if + innerHTML) ─────────────────────
  describe('introText', () => {
    it('should render intro-text div with innerHTML when introText is provided', () => {
      setConfig({ title: 'Title', introText: '<em>Intro</em>' });
      const intro = element.querySelector('.title-heading_intro-text') as HTMLElement;
      expect(intro).toBeTruthy();
      expect(intro.innerHTML).toContain('<em>Intro</em>');
    });

    it('should NOT render intro-text div for empty/whitespace introText', () => {
      setConfig({ title: 'Title', introText: '   ' });
      expect(element.querySelector('.title-heading_intro-text')).toBeNull();
    });
  });

  // ── 7. Title trimming ───────────────────────────────────
  describe('title trimming', () => {
    it('should trim whitespace from title', () => {
      setConfig({ title: '  Padded Title  ' });
      expect(heading('h2')!.textContent!.trim()).toBe('Padded Title');
    });
  });

  // ── 8. Reactive updates ─────────────────────────────────
  describe('reactive input changes', () => {
    it('should update heading tag when config changes', () => {
      setConfig({ title: 'First', htmlTag: TitleHeading.H1 });
      expect(heading('h1')).toBeTruthy();

      setConfig({ title: 'Second', htmlTag: TitleHeading.H4 });
      expect(heading('h1')).toBeNull();
      expect(heading('h4')).toBeTruthy();
      expect(heading('h4')!.textContent!.trim()).toBe('Second');
    });

    it('should update alignment host class on config change', () => {
      setConfig({ title: 'A', horizontalAlignment: HorizontalAlign.LEFT });
      expect(element.classList).toContain('title-heading--align-left');

      setConfig({ title: 'A', horizontalAlignment: HorizontalAlign.RIGHT });
      expect(element.classList).toContain('title-heading--align-right');
      expect(element.classList).not.toContain('title-heading--align-left');
    });
  });
});
