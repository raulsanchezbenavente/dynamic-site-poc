import { NgClass } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'form-custom-modal',
  templateUrl: './form-custom-modal.component.html',
  styleUrl: '../../stories/reactive-forms/styles/stories-styles.scss',
  imports: [NgClass],
  standalone: true,
})
export class FormCustomModalComponent {
  @Output() public closeModal = new EventEmitter<void>();

  @Input() public modalDialogConfig!: any;
  @Input() public config!: any;

  public onClose(): void {
    this.closeModal.emit();
  }

  public formatJsonForHtml(json: any): string {
    try {
      const formatted = this.stringifyWithLocalDates(json);
      return this.escapeHtml(formatted);
    } catch (error) {
      console.error('JSON format error:', error);
      return 'JSON format error';
    }
  }

  private escapeHtml(text: string): string {
    return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  private stringifyWithLocalDates = (obj: any): string => {
    const transformDates = (value: any): any => {
      if (value instanceof Date) {
        const year = value.getFullYear();
        const month = String(value.getMonth() + 1).padStart(2, '0');
        const day = String(value.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      }
      if (Array.isArray(value)) {
        return value.map((item) => transformDates(item));
      }
      if (value && typeof value === 'object') {
        const transformed: any = {};
        for (const key in value) {
          if (Object.prototype.hasOwnProperty.call(value, key)) {
            transformed[key] = transformDates(value[key]);
          }
        }
        return transformed;
      }
      return value;
    };
    const cleanObj = transformDates(obj);
    return JSON.stringify(cleanObj, null, 2);
  };
}
