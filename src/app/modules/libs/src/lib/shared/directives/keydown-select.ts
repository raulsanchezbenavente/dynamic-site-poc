import { Directive, EventEmitter, HostListener, Input, OnDestroy, Output } from '@angular/core';
import { interval, Subscription } from 'rxjs';

import { KeyCodeEnum } from '../enums';

@Directive({
  selector: '[keydownSelect]',
  standalone: true,
})
export class KeydownSelectDirective implements OnDestroy {
  sub!: Subscription;
  avoidAutoScrolling!: boolean;

  @Input() isVisible!: boolean;
  // tslint:disable-next-line: no-any
  @Input() options: any;
  // tslint:disable-next-line: no-any
  @Input() selectedOption: any;
  @Input() indexSelectedOption!: number;
  @Input() searchText!: string;
  @Input() isNumeric!: boolean;
  @Input() isExpiryDate!: boolean;
  @Input() isCurrencySelect!: boolean;

  @Output()
  public keydownSelect = new EventEmitter();

  @HostListener('keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (this.isVisible) {
      event.preventDefault();
      event.stopPropagation();
      switch (event.key) {
        case KeyCodeEnum.ESCAPE:
          this.isVisible = false;
          if (this.selectedOption) {
            this.indexSelectedOption = this.options.findIndex(
              (op: { code: any }) => op.code === this.selectedOption.code
            );
          }
          this.stopInterval();
          break;

        case KeyCodeEnum.TAB:
          this.isVisible = false;
          this.stopInterval();
          break;

        case KeyCodeEnum.ARROW_UP:
          this.handleArrowUp();
          break;

        case KeyCodeEnum.ARROW_DOWN:
          this.handleArrowDown();
          break;

        case KeyCodeEnum.ENTER:
          this.selectedOption = this.options[this.indexSelectedOption];
          this.isVisible = false;
          break;
      }
    } else {
      switch (event.key) {
        case KeyCodeEnum.ARROW_UP:
          this.isVisible = true;
          this.handleArrowUp();
          break;

        case KeyCodeEnum.ARROW_DOWN:
          this.isVisible = true;
          this.handleArrowDown();
          break;

        case KeyCodeEnum.ENTER:
          this.isVisible = true;
          event.preventDefault();
          event.stopPropagation();
          this.avoidAutoScrolling = false;
          break;
      }
    }
    this.setSelectedOptionByInputValue(event);

    const packageToEmit = {
      searchText: this.searchText,
      indexSelectedOption: this.indexSelectedOption,
      isVisible: this.isVisible,
      avoidAutoScrolling: this.avoidAutoScrolling,
      selectedOption: this.selectedOption,
      key: event.key,
    };
    this.keydownSelect.emit(packageToEmit);
  }

  setSelected(searchText: string) {
    let indexAlpha;
    if (this.isExpiryDate) {
      indexAlpha = this.options.findIndex((op: string) => op.startsWith(searchText));
    } else if (this.isCurrencySelect) {
      indexAlpha = this.options.findIndex((op: { code: string }) => op.code.startsWith(searchText));
    } else {
      indexAlpha = this.options.findIndex((op: { name: string }) => op.name.startsWith(searchText));
    }

    if (indexAlpha !== -1) {
      this.indexSelectedOption = indexAlpha;
      this.avoidAutoScrolling = false;
    }
  }

  initInterval() {
    this.stopInterval();
    this.sub = interval(1000).subscribe(() => {
      this.searchText = null!;
    });
  }

  stopInterval() {
    this.unSubscribe();
  }

  ngOnDestroy() {
    this.unSubscribe();
  }

  unSubscribe() {
    if (this.sub !== undefined) {
      this.sub.unsubscribe();
    }
  }

  searchByNumber(numeric: any) {
    this.initInterval();
    this.searchText = this.searchText === null || this.searchText === undefined ? numeric : this.searchText + numeric;
    const auxArrayOfOptions = structuredClone(this.options);
    for (const option of auxArrayOfOptions) {
      option.code.replace('+', '');
      option.code.replace('-', '');
    }
    const indexAlpha = auxArrayOfOptions.findIndex((op: any) => op.code.startsWith(this.searchText));
    if (indexAlpha !== -1) {
      this.indexSelectedOption = indexAlpha;
      this.avoidAutoScrolling = false;
    }
  }

  protected handleArrowUp() {
    if (this.indexSelectedOption > 0) {
      this.indexSelectedOption = this.indexSelectedOption - 1;
      this.avoidAutoScrolling = false;
    }
  }

  protected handleArrowDown() {
    if (this.indexSelectedOption < this.options.length - 1) {
      this.indexSelectedOption = this.indexSelectedOption + 1;
      this.avoidAutoScrolling = false;
    }
  }

  protected setSelectedOptionByInputValue(event: any) {
    if (/^[A-Z]+$/i.test(event.key) && event.key.length === 1) {
      this.initInterval();
      this.searchText =
        this.searchText === null || this.searchText === undefined
          ? event.key.toUpperCase()
          : this.searchText + event.key.toLowerCase();
      this.setSelected(this.searchText);
    } else if (/^-?\d+$/i.test(event.key) && !this.isNumeric) {
      this.initInterval();
      this.searchText =
        this.searchText === null || this.searchText === undefined ? event.key : this.searchText + event.key;
      this.setSelected(this.searchText);
    } else if (/^-?\d+$/i.test(event.key) && this.isNumeric) {
      this.searchByNumber(event.key);
    }
  }
}
