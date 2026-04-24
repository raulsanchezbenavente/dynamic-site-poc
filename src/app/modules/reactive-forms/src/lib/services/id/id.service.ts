import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class IdService {
  public generateRandomId(): string {
    return Array.from({ length: 8 }, () => String.fromCodePoint(97 + Math.floor(Math.random() * 26))).join('');
  }
}
