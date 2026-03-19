import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

export type TabDefinition = {
  id: string;
  label: string;
  icon?: string;
  isValid?: boolean;
};

@Component({
  selector: 'generic-tabs',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <div class="tabs-container">
      <div class="tabs-list">
        @for (tab of tabs; track tab.id) {
          <button
            type="button"
            class="tab-button"
            [class.is-active]="activeTabId === tab.id"
            (click)="onTabClick(tab.id)">
            @if (tab.icon) {
              <span
                class="tab-icon"
                aria-hidden="true"
                >{{ tab.icon }}</span
              >
            }
            <span>{{ tab.label | translate }}</span>
            @if (tab.isValid === false) {
              <span
                class="tab-alert"
                aria-hidden="true"
                >!</span
              >
            }
          </button>
        }
      </div>
    </div>
  `,
  styles: [
    `
      .tabs-container {
        display: flex;
        flex-direction: column;
      }

      .tabs-list {
        display: flex;
        gap: 8px;
        border-bottom: 1px solid #e0e0e0;
      }

      .tab-button {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px 16px;
        background: transparent;
        border: none;
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
        color: #666;
        position: relative;
        transition: color 200ms ease;
      }

      .tab-button:hover {
        color: #333;
      }

      .tab-button.is-active {
        color: #0b7285;
        font-weight: 600;
      }

      .tab-button.is-active::after {
        content: '';
        position: absolute;
        bottom: -1px;
        left: 0;
        right: 0;
        height: 2px;
        background: #0b7285;
      }

      .tab-icon {
        font-size: 16px;
      }

      .tab-alert {
        display: inline-flex;
        width: 18px;
        height: 18px;
        align-items: center;
        justify-content: center;
        background: #ff4757;
        color: white;
        border-radius: 50%;
        font-size: 11px;
        font-weight: 700;
        margin-left: 4px;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GenericTabsComponent {
  @Input() public tabs: TabDefinition[] = [];
  @Input() public activeTabId: string = '';
  @Output() public tabChanged = new EventEmitter<string>();

  public onTabClick(tabId: string): void {
    this.tabChanged.emit(tabId);
  }
}
