import { NgTemplateOutlet } from '@angular/common';
import { Component, EventEmitter, inject, input, OnInit, Output, ViewEncapsulation } from '@angular/core';
import {
  AccessibleLinkDirective,
  DictionaryType,
  GenerateIdPipe,
  IValueEmitterComponent,
  LinkTarget,
  OptionsList,
  OptionsListConfig,
  OptionsListMode,
} from '@dcx/ui/libs';
import { TranslateModule } from '@ngx-translate/core';

import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'options-list',
  templateUrl: './options-list.component.html',
  styleUrls: ['./styles/options-list.styles.scss'],
  host: { class: 'ds-options-list' },
  encapsulation: ViewEncapsulation.None,
  imports: [TranslateModule, IconComponent, NgTemplateOutlet, AccessibleLinkDirective],
  standalone: true,
})
export class OptionsListComponent implements OnInit, IValueEmitterComponent {
  public readonly config = input.required<OptionsListConfig>();
  public readonly translations = input<DictionaryType | null>(null);

  /**
   * Emit event to filter selection
   */
  @Output() public valueEmitter = new EventEmitter<OptionsList>();

  @Output() public idEmitter = new EventEmitter<string>();
  /**
   * Properties used for accessibility
   */
  public listId!: string;
  public optionId!: string;
  public ariaDisabled?: boolean;
  public linkTarget = LinkTarget;

  /**
   * Determines the current interaction mode for the options list.
   * Falls back to 'selection' if no mode is explicitly set in the config.
   */
  public get mode(): OptionsListMode {
    return this.config()?.mode ?? 'selection';
  }

  /**
   * Returns the appropriate ARIA role for the root list container.
   * - 'listbox' is used when the component is in 'selection' mode (e.g. filters, dropdown selects).
   * - 'menu' is used when the component is in 'menu' mode (e.g. menu drawers, page menus).
   * This ensures semantic correctness and proper screen reader behavior.
   */
  public get listRole(): 'listbox' | 'menu' {
    return this.mode === 'selection' ? 'listbox' : 'menu';
  }

  /**
   * Returns the appropriate ARIA role for each list item.
   * - 'option' is used in 'selection' mode, representing a selectable item within a listbox.
   * - 'menuitem' is used in 'menu' mode, representing an interactive item within a menu.
   * The roles align with the WAI-ARIA Authoring Practices for composite widgets.
   */
  public get itemRole(): 'option' | 'menuitem' {
    return this.mode === 'selection' ? 'option' : 'menuitem';
  }

  // providers
  private readonly generateId = inject(GenerateIdPipe);

  public ngOnInit(): void {
    const cfg = this.config();

    if (cfg.accessibilityConfig?.id) {
      this.idEmitter.emit(cfg.accessibilityConfig.id);
      this.listId = cfg.accessibilityConfig.id;
    } else {
      this.listId = this.generateId.transform('optionListId_');
    }
  }

  public optionClicked(selectedOption: OptionsList): void {
    if (!selectedOption.isDisabled) {
      for (const x of this.config()?.options || []) {
        x.isSelected = false;
      }
      selectedOption.isSelected = true;
      this.valueEmitter.emit(selectedOption);
    }
  }

  public multiselectOptionClicked(isChecked: boolean, selectedOption: OptionsList): void {
    if (!selectedOption.isDisabled) {
      selectedOption.isSelected = isChecked;
      this.valueEmitter.emit(selectedOption);
    }
  }
}
