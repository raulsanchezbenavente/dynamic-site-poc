import { NgClass } from '@angular/common';
import {
  AfterContentInit,
  AfterViewInit,
  Component,
  effect,
  ElementRef,
  HostBinding,
  inject,
  input,
  model,
  OnInit,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { FormControlState, FormsModule, NG_VALIDATORS, NG_VALUE_ACCESSOR } from '@angular/forms';
import { asyncScheduler, observeOn, of, take } from 'rxjs';

import { RfBaseReactiveComponent } from '../../abstract/components/rf-base-reactive.component';
import { RfOptionsFilter } from '../../services/filter/filter.model';
import { FilterService } from '../../services/filter/filter.service';
import { RfDebugStateComponent } from '../common/rf-debug-state/rf-debug-state.component';
import { RfErrorMessageSingleComponent } from '../common/rf-error-messages/models/rf-error-messages.model';
import { RfErrorMessagesComponent } from '../common/rf-error-messages/rf-error-messages.component';
import { RfHintMessagesComponent } from '../common/rf-hint-messages/rf-hint-messages.component';

import { RfListClasses } from './models/rf-list-classes.model';
import { RfListSelectEvent } from './models/rf-list-events.model';
import { RfListOption } from './models/rf-list-option.model';

/**
 * Reactive list component for selecting from a list of options.
 *
 * Features:
 * - Option filtering via text input
 * - Keyboard navigation (arrow keys, typeahead)
 * - Standalone and reactive forms support
 * - Option selection and value binding
 * - Emits events on selection, blur, and key interaction
 */
/**
 * Reactive list component for selecting from a list of options.
 *
 * Features:
 * - Option filtering via text input
 * - Keyboard navigation (arrow keys, typeahead)
 * - Standalone and reactive forms support
 * - Option selection and value binding
 * - Emits events on selection, blur, and key interaction
 */
@Component({
  selector: 'rf-list',
  templateUrl: './rf-list.component.html',
  styleUrls: ['./styles/rf-list.styles.scss'],
  host: { class: 'rf-list' },
  standalone: true,
  exportAs: 'dsList',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: RfListComponent,
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: RfListComponent,
      multi: true,
    },
  ],
  imports: [NgClass, FormsModule, RfErrorMessagesComponent, RfHintMessagesComponent, RfDebugStateComponent],
})
export class RfListComponent
  extends RfBaseReactiveComponent<
    string | FormControlState<string>,
    string,
    RfErrorMessageSingleComponent,
    RfListClasses,
    string
  >
  implements OnInit, AfterViewInit, AfterContentInit
{
  /** Emits when an option is selected */
  public selectOption = output<RfListSelectEvent>();
  /** Emits when the filter input loses focus */
  public blurFilter = output<FocusEvent>();
  /** Emits when a key is pressed on the filter input */
  public keyPressed = output<KeyboardEvent>();
  /** Reference to the filter input element */
  public readonly inputFilter = viewChild<ElementRef>('filterElement');

  @HostBinding('class') get hostClasses(): string {
    return this.classes()?.container ?? '';
  }

  /** The list of selectable options */
  public options = model<RfListOption[]>([]);
  /** Placeholder text for the filter input */
  public placeholder = input<string>('');
  /** Filter configuration for the list */
  public filter = input<RfOptionsFilter>();
  /** If true, disables typeahead navigation */
  public bypassKeys = model<boolean>(false);
  /** If true, enables typeahead includes instead startwith */
  public typeaheadIncludes = input<boolean>(false);
  /** Currently selected option */
  public selectedOption?: RfListOption;
  /** Currently selected readonly option */
  public selectedOptionReadonly?: RfListOption;
  /** Current filter input value */
  public filterValue: string = '';
  /** Index of the currently focused option */
  public activeIndex: number = -1;
  /** Type identifier used internally */
  public override rfTypeClass: string = 'RfListComponent';
  /** Service used to filter the list of options */
  private readonly filterService = inject(FilterService);
  /** Buffer of typed characters for typeahead navigation */
  private typeaheadBuffer: string = '';
  /** Timeout reference for clearing the typeahead buffer */
  private typeaheadTimeout: ReturnType<typeof setTimeout> | undefined;

  /** Set the preferred options at the begining */
  private readonly registerEffect = effect(() => {
    const original = this.options();
    const sorted = original.slice().sort((a, b) => (b.preferred ? 1 : 0) - (a.preferred ? 1 : 0));
    const hasChanged = original.some((item, i) => item !== sorted[i]);
    if (hasChanged) {
      this.options.set(sorted);
    }
    const lastIndex = sorted.map((o) => o.preferred ?? false).lastIndexOf(true);
    this.lastPreferredIndex.set(lastIndex >= 0 ? lastIndex : null);
  });

  /** Store the las option with the preferred attribute */
  public readonly lastPreferredIndex = signal<number | null>(null);

  /** React to parentId changes to compute the component autoId */
  private readonly parentIdEffect = effect(() => {
    this.autoId = this.parentAutoId();
    this.changeDetector.markForCheck();
  });

  /**
   * Lifecycle hook called on component initialization.
   * Sets up standalone control behavior for disabled state.
   */
  public ngOnInit(): void {
    if (!this.formControlName()) {
      this.onChangeDisabledState.subscribe((isDisabled: boolean) => {
        isDisabled ? this.control?.disable() : this.control?.enable();
      });
    }
  }

  /**
   * Get the element reference for the filter input.
   */
  public override getElementRef(): ElementRef {
    return this.inputFilter()!;
  }

  /**
   * Writes a value into the component from the form control.
   * Syncs selected option from the available list.
   *
   * @param value The value or form control state to write
   */
  public override writeValue(value: string | FormControlState<string>): void {
    if (!value) {
      value = '';
    }
    if (typeof value === 'string') {
      this.value.set(value ?? '');
    }
    if (typeof value === 'object' && 'value' in value) {
      this.value.set(value.value);
    }
    this.selectedOption = this.options()?.find((opt) => opt.value === this.value());
  }

  /**
   * Lifecycle hook after content projection is initialized.
   * Handles initial selection and control enable/disable in standalone mode.
   */
  public override ngAfterContentInit(): void {
    super.ngAfterContentInit();
    if (!this.formControlName()) {
      this.selectedOption = this.options()?.find((opt) => opt.value === this.value());
      this.disabled() ? this.control?.disable() : this.control?.enable();
    }
  }

  /**
   * Lifecycle hook called after the component's view has been fully initialized.
   * Subscribes to control status changes if in standalone mode.
   */
  public ngAfterViewInit(): void {
    if (!this.formControlName()) {
      this.control?.statusChanges.subscribe(() => {
        const isDisabled: boolean = this.control?.disabled || false;
        this.disabled.set(isDisabled);
      });
    }
    this.autoId = this.generateAutoId();
  }

  /**
   * Updates the component's value based on user interaction.
   * Emits a selection event and updates form state.
   *
   * @param value The selected value
   * @param event The triggering DOM event
   */
  public updateValue(value: string, event: Event): void {
    event.preventDefault();
    const previousValue = this.value();
    this.value.set(value);
    of(null)
      .pipe(observeOn(asyncScheduler), take(1))
      .subscribe(() => {
        this.selectedOption = this.options()?.find((opt) => opt.value === value);
        if (value !== previousValue) {
          this.onChange(value);

          this.selectOption.emit({ option: this.selectedOption as RfListOption, nativeEvent: event as MouseEvent });
          if (!this.formControlName()) {
            this.control?.setValue(value, { emitEvent: false });
            this.control?.markAsDirty();
          }
        }
        this.changeDetector.markForCheck();
      });
  }

  /**
   * Clears the internal filter input value.
   */
  public resetFilter(): void {
    this.filterValue = '';
  }

  /**
   * Focuses the internal filter input field, if present.
   */
  public override focus(): void {
    if (this.inputFilter()) {
      this.inputFilter()?.nativeElement.focus();
    }
  }

  /**
   * Set the focus on focussable element when there is an error
   */
  public override focusError(): void {
    this.focus();
  }

  /**
   * Scrolls the selected option into view.
   */
  public focusOption(): void {
    if (this.selectedOption || this.selectedOptionReadonly) {
      const option = this.readonly()
        ? (this.selectedOptionReadonly ?? this.selectedOption)
        : (this.selectedOption ?? this.selectedOptionReadonly);
      if (!option) {
        return;
      }
      const value: string = option.value;
      const selectedOption: HTMLElement | null = document.getElementById(
        (this.parentId() ?? this.getFullFormControlName()) + '-' + value
      );
      selectedOption?.scrollIntoView({ behavior: 'instant', block: 'nearest' });
      selectedOption?.focus();
    }
  }

  /**
   * Handles keyboard navigation and typeahead for the list.
   *
   * @param event The keyboard event
   */
  public handleKeyDown(event: KeyboardEvent): void {
    if (!this.disabled()) {
      this.keyPressed.emit(event);
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        this.moveSelection('down');
      }
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        this.moveSelection('up');
      }
    }
    if (!this.readonly() && !this.bypassKeys()) {
      this.handleTypeAheadKey(event);
    }
  }

  /**
   * Moves the selected option up or down in the list based on direction.
   *
   * @param direction 'up' or 'down'
   */
  public moveSelection(direction: 'up' | 'down'): void {
    const opts = this.filteredOptions();
    if (!opts || opts.length === 0) return;
    const currentIndex = this.readonly()
      ? opts.findIndex((opt) => opt.value === this.selectedOptionReadonly?.value)
      : opts.findIndex((opt) => opt.value === this.selectedOption?.value);
    let newIndex = currentIndex;
    if (direction === 'up' && currentIndex > 0) {
      newIndex = currentIndex - 1;
    }
    if (direction === 'down' && currentIndex < opts.length - 1) {
      newIndex = currentIndex + 1;
    }
    if (newIndex !== currentIndex) {
      if (this.readonly()) {
        this.selectedOptionReadonly = opts[newIndex];
      } else {
        this.selectedOption = opts[newIndex];
        if (!opts[newIndex].disabled) {
          this.value.set(this.selectedOption.value);
          this.onChange(this.selectedOption.value);
          // Emit a synthetic MouseEvent for keyboard-based selection to unify event handling
          const syntheticEvent = new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            clientX: 0,
            clientY: 0,
          });
          this.selectOption.emit({ option: this.selectedOption, nativeEvent: syntheticEvent });
        }
      }
    }
    this.focusOption();
  }

  /**
   * Handles typeahead character input to jump to matching options.
   *
   * @param event The keyboard event representing a character key
   */
  public handleTypeAheadKey(event: KeyboardEvent): void {
    const char: string = event.key;
    if (char.length > 1 || event.ctrlKey || event.metaKey || event.altKey) return;
    this.typeaheadBuffer += char.toLowerCase();
    clearTimeout(this.typeaheadTimeout);
    this.typeaheadTimeout = setTimeout(() => {
      this.typeaheadBuffer = '';
    }, 700);
    const match: RfListOption | undefined = this.options().find((opt) => {
      if (opt.disabled) return false;
      const text = this.extractPlainText(opt.content);
      return text[this.typeaheadIncludes() ? 'includes' : 'startsWith'](this.typeaheadBuffer);
    });
    if (match) {
      this.updateValue(match.value, new KeyboardEvent('typeahead'));
      this.focusOption();
    }
  }

  /**
   * Handles focus leaving the list component to emit touched status.
   *
   * @param event The focus event
   */
  protected handleFocusOut(event: FocusEvent): void {
    if (!this.parentId()) {
      const relatedTarget = event.relatedTarget as HTMLElement | null;
      const hostElement = event.currentTarget as HTMLElement;
      if (!relatedTarget || !hostElement.contains(relatedTarget)) {
        this.decideIfEmitTouch();
      }
    }
  }

  /**
   * Marks the control as touched if not in reactive form mode.
   */
  protected decideIfEmitTouch(): void {
    if (this.mouseDownIsInProgress) {
      this.actionBlurIsPending = true;
    } else {
      this.executeActionBlur();
    }
  }

  /** Handles blur event to mark control as touched */
  public override executeActionBlur(): void {
    if (!this.formControlName()) {
      this.control?.markAsTouched();
    }
    this.onTouched();
  }

  /**
   * Returns the currently filtered list of options.
   */
  protected filteredOptions(): RfListOption[] {
    return this.filterService.filter(this.filter()!, this.options(), this.filterValue);
  }

  /**
   * Emits blur event from the filter input.
   *
   * @param event The blur event from the input
   */
  protected onBlurFilter(event: FocusEvent): void {
    this.blurFilter.emit(event);
  }

  /**
   * Extracts and normalizes plain text from HTML content.
   *
   * @param safeHtml A string containing HTML
   * @returns A lowercase plain text string without markup
   */
  private extractPlainText(safeHtml: any): string {
    const div = document.createElement('div');
    div.innerHTML = safeHtml as string;
    return div.textContent?.trim().toLowerCase() ?? '';
  }
}
