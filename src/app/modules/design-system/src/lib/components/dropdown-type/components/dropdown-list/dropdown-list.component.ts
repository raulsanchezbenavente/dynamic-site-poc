import { Component, EventEmitter, Input, OnInit, Output, ViewChild, ViewEncapsulation } from '@angular/core';
import { DictionaryType, DropdownListConfig, OptionsList } from '@dcx/ui/libs';

import { resolveDropdownValueFromOptions } from './helpers/dropdown-value-from-options.helper';
import { DropdownComponent } from '../../../dropdown/dropdown.component';
import { OptionsListComponent } from '../../../options-list/options-list.component';

@Component({
  selector: 'dropdown-list',
  templateUrl: './dropdown-list.component.html',
  encapsulation: ViewEncapsulation.None,
  host: { class: 'ds-dropdown-list' },
  imports: [DropdownComponent, OptionsListComponent],
  standalone: true
})
export class DropdownListComponent implements OnInit {
  @Input() public config!: DropdownListConfig;
  @Input() public translations!: DictionaryType;

  @ViewChild('dropdownRef', { static: false })
  private readonly dropdownRef!: DropdownComponent;

  @Output() private readonly dropdownOptionValueEmitter = new EventEmitter<OptionsList>();

  public ngOnInit(): void {
    const resolvedValue = resolveDropdownValueFromOptions(
      this.config.dropdownModel.value,
      this.config.optionsListConfig.options
    );

    this.config.dropdownModel.value = resolvedValue;

    // Set displayLabel based on selected option name if it hasn't been set externally
    if (!this.config.dropdownModel.displayLabel) {
      const selected = this.config.optionsListConfig.options.find((opt) => opt.code === resolvedValue);
      this.config.dropdownModel.displayLabel = selected?.name ?? '';
    }
  }

  public selectOption(selectedOption: OptionsList): void {
    this.config.dropdownModel.value = selectedOption.code ?? '';

    // Set displayLabel based on selected option name (can be overridden by parent after emit)
    this.config.dropdownModel.displayLabel = selectedOption.name ?? '';

    // Set displayLabel based on selected option name (can be overridden by parent after emit)
    this.dropdownOptionValueEmitter.emit(selectedOption);
  }

  /**
   * When the dropdown opens:
   * - Scroll to the currently selected option (if any)
   * - Move focus to the selected option, or fallback to the first visible option
   */
  public onDropdownOpened(): void {
    const layout = this.config.dropdownModel.config.layoutConfig;
    if (layout.isAlwaysVisible) return;

    requestAnimationFrame(() => {
      this.dropdownRef.scrollToSelectedOptionInContent();

      const content = this.dropdownRef.getContentElement();
      const selected = content?.querySelector('[aria-selected="true"]') as HTMLElement;
      const first = content?.querySelector('[role="option"]') as HTMLElement;

      const toFocus = selected ?? first;
      if (toFocus) {
        toFocus.focus();
      }
    });
  }
}
