import { NgStyle } from '@angular/common';
import { ChangeDetectorRef, Component, effect, inject, input, OnChanges, signal } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { AriaAttributes, ComposerService } from '@dcx/ui/libs';
import { delay, of } from 'rxjs';

import { TabSkeletonComponent } from '../tab-skeleton/tab-skeleton.component';

@Component({
  selector: 'tab',
  templateUrl: './tab.component.html',
  styleUrls: ['./styles/tab.styles.scss'],
  imports: [TabSkeletonComponent, NgStyle],
  standalone: true,
})
export class TabComponent implements OnChanges {
  public readonly content = input<string | null>(null);
  public safeContent = signal<SafeHtml | null>(null);
  public isFirstLoad = signal(false);
  public isContentHidden = signal<boolean>(true);
  private readonly _isSelected = signal(false);
  private readonly _ids = signal<AriaAttributes>({});
  public readonly isLoadingComponent = signal<boolean>(true);
  private readonly isolatedLoadingComponentIds = signal<string[]>([]);

  public isSelected = this._isSelected.asReadonly();
  public ids = this._ids.asReadonly();

  private readonly sanitizer = inject(DomSanitizer);
  private readonly composer = inject(ComposerService);

  private readonly detectorChanges = inject(ChangeDetectorRef);

  public visibilityStatus: string = 'none';
  private readonly visibilityDelay: number = 200;

  constructor() {
    this.showLoaderOnSubmit();
  }

  public ngOnChanges(): void {
    const html = this.content();
    if (html) {
      this.safeContent.set(this.sanitizer.bypassSecurityTrustHtml(html));
      this.extractIsolatedLoadingComponents(html);
    }
  }

  /**
   * Extract component IDs that have data-isolated-loading attribute
   * @param html - The HTML content to parse
   */
  private extractIsolatedLoadingComponents(html: string): void {
    const MAX_HTML = 2_000_000;
    if (html.length > MAX_HTML) {
      console.warn('Too big HTML content, truncating for parsing.');
      html = html.slice(0, MAX_HTML);
    }
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const nodes = doc.querySelectorAll<HTMLElement>('dcx-component[data-module-id][data-isolated-loading]');
    const ids = new Set<string>();
    for (const el of Array.from(nodes)) {
      if (el instanceof HTMLElement) {
        const id = el.dataset['moduleId'];
        if (id) ids.add(id);
      }
    }

    this.isolatedLoadingComponentIds.set([...ids]);
  }

  /**
   * Marks the tab as selected or not.
   * Triggers `isFirstLoad` only once, the first time it becomes selected.
   *
   * @param selected - Whether the tab should be marked as selected.
   */
  private _hasBeenLoaded = false;

  public setSelected(selected: boolean): void {
    this._isSelected.set(selected);
    if (selected && !this._hasBeenLoaded) {
      this._hasBeenLoaded = true;
      this.isFirstLoad.set(true);
    }
    of(null)
      .pipe(delay(this.visibilityDelay))
      .subscribe(() => {
        this.visibilityStatus = selected ? 'block' : 'none';
        this.detectorChanges.detectChanges();
      });
  }

  /**
   * Assigns ARIA attributes to the tab element.
   *
   * Updates the internal `_ids` signal with the provided ARIA attributes
   * to enhance accessibility.
   *
   * @param data - An object containing `ariaControls` values.
   */
  public setIds(data: AriaAttributes): void {
    this._ids.set(data);
  }

  /**
   * Checks if any of the tab's components are currently loading.
   * Updates the `isContentHidden` and `isLoadingComponent` signals accordingly.
   */
  private showLoaderOnSubmit(): void {
    effect(() => {
      const isSubmitting = this.composer.runningSubmit();
      const loadingComponentsList = this.composer.isolatedLoadingComponentsList();
      const myComponentIds = this.isolatedLoadingComponentIds();

      // Check if any of this tab's components are in the loading list
      const tabComponentsLoading = myComponentIds.some((id) => loadingComponentsList.includes(id));

      const isLoading = isSubmitting || tabComponentsLoading;
      this.isContentHidden.set(isLoading);
      this.isLoadingComponent.set(isLoading);
    });
  }
}
