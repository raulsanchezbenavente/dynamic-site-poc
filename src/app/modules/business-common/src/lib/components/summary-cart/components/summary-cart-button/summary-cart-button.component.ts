import {
  AfterViewChecked,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  Input,
  input,
  output,
  Renderer2,
} from '@angular/core';
import { DsButtonComponent, PriceCurrencyComponent } from '@dcx/storybook/design-system';
import { TranslateService } from '@ngx-translate/core';

import { SummaryCartButtonConfig } from './models/summary-cart-button.config';
import { TranslationKeys } from '../../enums/translation-keys.enum';

/**
 * SummaryCart wrapper for <ds-button>.
 * - Forwards [ariaExpanded] from parent.
 * - Removes host-level aria-expanded to avoid duplicate attributes.
 * - Real aria-expanded is handled inside <ds-button>.
 */
@Component({
  selector: 'summary-cart-button',
  templateUrl: './summary-cart-button.component.html',
  host: {
    class: 'summary-cart-button',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DsButtonComponent, PriceCurrencyComponent],
  standalone: true,
})
export class SummaryCartButtonComponent implements AfterViewChecked {
  @Input() public ariaExpanded: boolean | null | undefined;

  public readonly config = input.required<SummaryCartButtonConfig>();
  public readonly buttonClicked = output<void>();

  private readonly translate = inject(TranslateService);

  public readonly summaryA11yTitleText = computed(() => {
    return this.translate.instant(TranslationKeys.Basket_Book_Summary_Title);
  });

  constructor(
    private readonly el: ElementRef,
    private readonly r: Renderer2
  ) {}

  public ngAfterViewChecked(): void {
    this.r.removeAttribute(this.el.nativeElement, 'aria-expanded');
  }

  public onClickHandler(): void {
    this.buttonClicked.emit();
  }
}
