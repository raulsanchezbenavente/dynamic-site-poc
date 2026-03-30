import { Injectable, Pipe, PipeTransform } from '@angular/core';
import { v4 as uuidv4 } from 'uuid';

@Pipe({
  name: 'generateId',
  standalone: true,
})
@Injectable({ providedIn: 'root' })
export class GenerateIdPipe implements PipeTransform {
  public transform(value: string): string {
    return value.concat((100 * Math.random()).toFixed(0));
  }

  public transformWithUUID(value: string): string {
    return `${value}_${uuidv4()}`;
  }
}
