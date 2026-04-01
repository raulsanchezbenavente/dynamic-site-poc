import { AfterViewInit, DestroyRef, Directive, ElementRef, inject, Input, Renderer2 } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslateService } from '@ngx-translate/core';
import { combineLatest, of } from 'rxjs';

import { LinkModel } from '../model/link.model';
import { ExternalLinkPipe } from '../pipes/external-link.pipe';

@Directive({
  selector: 'a[accessibleLink]',
  standalone: true,
})
export class AccessibleLinkDirective implements AfterViewInit {
  @Input() public link!: LinkModel;
  @Input() public skipRel = false;
  @Input() public showIcon = true;

  private readonly blank = '_blank';
  private readonly elem = inject(ElementRef<HTMLAnchorElement>);
  private readonly renderer = inject(Renderer2);
  private readonly translate = inject(TranslateService);
  private readonly externalLinkPipe = inject(ExternalLinkPipe);
  private readonly destroyRef = inject(DestroyRef);

  private readonly externalLinkKey = 'Common.A11y.ExternalLink';
  private readonly openNewWindowKey = 'Common.A11y.OpenNewWindow';
  private readonly SR_SEPARATOR = ', ';

  public ngAfterViewInit(): void {
    const anchorElem = this.elem.nativeElement;

    // Set href and target attributes
    this.renderer.setAttribute(anchorElem, 'href', this.link.url);

    if (this.link.target) {
      this.renderer.setAttribute(anchorElem, 'target', this.link.target);

      if (this.isTargetBlank()) {
        if (this.showIcon) {
          this.renderer.addClass(anchorElem, 'link--target-blank');
        }
        this.addRelAttribute(anchorElem);
      }
    }

    const isExternal = this.externalLinkPipe.transform(this.link.url);

    // Handle aria-label dynamically
    this.updateAriaLabel(anchorElem, isExternal);

    // Ensure rel="noopener noreferrer" for security
    if (!this.skipRel && this.isTargetBlank()) {
      this.addRelAttribute(anchorElem);
    }
  }

  private isTargetBlank(): boolean {
    return this.link.target === this.blank;
  }

  private addRelAttribute(a: HTMLAnchorElement): void {
    const current = a.getAttribute('rel') || '';
    const values = current.split(' ').filter(Boolean);
    if (!values.includes('noopener')) values.push('noopener');
    if (!values.includes('noreferrer')) values.push('noreferrer');
    this.renderer.setAttribute(a, 'rel', values.join(' '));
  }

  private updateAriaLabel(anchorElem: HTMLAnchorElement, isExternal: boolean): void {
    // If the parent already sets an aria-label, don’t override it.
    if (anchorElem.hasAttribute('aria-label')) return;

    const isBlank = anchorElem.target === this.blank;
    const baseText = anchorElem.getAttribute('title') || anchorElem.textContent?.trim() || anchorElem.href;

    const external$ = isExternal ? this.translate.stream(this.externalLinkKey) : of<string | null>(null);
    const newWindow$ = isBlank ? this.translate.stream(this.openNewWindowKey) : of<string | null>(null);

    combineLatest([external$, newWindow$])
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(([ext, nw]) => {
        const parts: string[] = [];

        // Skip values that match the key — likely means the dictionary isn’t loaded yet.
        if (ext && ext !== this.externalLinkKey) parts.push(ext);
        if (nw && nw !== this.openNewWindowKey) parts.push(nw);

        if (!parts.length) return;

        this.renderer.setAttribute(anchorElem, 'aria-label', `${baseText} (${parts.join(this.SR_SEPARATOR)})`);
      });
  }
}
