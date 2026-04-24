import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class I18n {
  private culture = 'en-US';

  get language(): string {
    return this.culture;
  }

  set language(value: string) {
    this.culture = value;
  }
}
