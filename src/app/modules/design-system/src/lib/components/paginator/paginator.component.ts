import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  signal,
  ViewEncapsulation,
} from '@angular/core';
import { MODULE_TRANSLATION_MAP, TranslationLoadStatusDirective } from '@dcx/module/translation';
import { ViewportSizeService } from '@dcx/ui/libs';
import { TranslateModule } from '@ngx-translate/core';

import { TranslationKeys } from './enums/translation-keys.enum';
import { PaginatorConfig } from './models/paginator.config';

@Component({
  selector: 'ds-paginator',
  templateUrl: './paginator.component.html',
  styleUrls: ['./styles/pagination.styles.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslateModule, TranslationLoadStatusDirective],
  standalone: true,
})
export class PaginatorComponent implements OnInit {
  @Output() public selectPageEmitter = new EventEmitter<number>();

  public configData: PaginatorConfig;
  public firstNumberToShow: number;
  public lastNumberToShow: number;
  public items: number[];

  public isResponsive = signal<boolean>(false);
  private mediaQuery!: MediaQueryList;
  private mediaQueryListener!: (event: MediaQueryListEvent) => void;
  protected readonly TranslationKeys = TranslationKeys;

  private readonly CMSKey = 'Pagination';
  protected readonly mappedKeys = MODULE_TRANSLATION_MAP[this.CMSKey];

  @Input() set config(value: PaginatorConfig) {
    this.configData = value;
    this.itemsToBeDisplayed();
  }

  get config(): PaginatorConfig {
    return this.configData;
  }

  constructor(private readonly viewportSizeService: ViewportSizeService) {
    this.configData = {} as PaginatorConfig;
    this.firstNumberToShow = 0;
    this.lastNumberToShow = 0;
    this.items = [];
  }

  public ngOnInit(): void {
    this.internalInit();
  }

  /**
   * Emmit select event with selected page
   */

  public onSelect(value: number): void {
    this.configData.currentPage = value;
    this.itemsToBeDisplayed();
    this.selectPageEmitter.emit(this.configData.currentPage);
  }

  /**
   * Select next page
   */

  public onNext(): void {
    if (this.configData.currentPage < this.configData.totalPages) {
      this.onSelect(this.configData.currentPage + 1);
    }
  }

  /**
   * Select previous page
   */
  public onPrevious(): void {
    if (this.configData.currentPage > 1) {
      this.onSelect(this.configData.currentPage - 1);
    }
  }

  protected internalInit(): void {
    this.setIsResponsive();
  }

  private setIsResponsive(): void {
    const breakpoint = this.viewportSizeService.getComponentLayoutBreakpoint('--paginator-layout-breakpoint');

    this.mediaQuery = globalThis.matchMedia(`(max-width: ${breakpoint}px)`);
    this.isResponsive.set(this.mediaQuery.matches);

    this.mediaQueryListener = (event: MediaQueryListEvent): void => {
      this.isResponsive.set(event.matches);
      this.itemsToBeDisplayed();
    };

    this.mediaQuery.addEventListener('change', this.mediaQueryListener);
    this.itemsToBeDisplayed();
  }

  /**
   * In ngOnInit() method and every time a page is selected or the arrows are cliked, this method is called to display
   * the updated page numbers (items).
   */
  private itemsToBeDisplayed(): void {
    const total = this.configData.totalPages ?? 0;
    let current = this.configData.currentPage ?? 1;
    if (total <= 0) {
      this.items = [];
      return;
    }

    current = Math.min(Math.max(current, 1), total);
    this.configData.currentPage = current;

    this.items = this.isResponsive?.() ? this.buildMobileItems(current, total) : this.buildDesktopItems(current, total);

    this.firstNumberToShow = this.items[0];
    this.lastNumberToShow = this.items.at(-1)!;
  }

  private buildDesktopItems(current: number, total: number): number[] {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

    if (current <= 5) return [1, 2, 3, 4, 5];
    if (current >= total - 4) return [total - 4, total - 3, total - 2, total - 1, total];

    return [current - 1, current, current + 1];
  }

  private buildMobileItems(current: number, total: number): number[] {
    if (total <= 3) return Array.from({ length: total }, (_, i) => i + 1);

    if (current <= 2) return [1, 2, 3];
    if (current >= total - 1) return [total - 2, total - 1, total];
    return [current - 1, current, current + 1];
  }
}
