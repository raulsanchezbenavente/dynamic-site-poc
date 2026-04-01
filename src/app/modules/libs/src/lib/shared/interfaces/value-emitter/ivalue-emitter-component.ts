import { Observable } from 'rxjs';

export interface IValueEmitterComponent {
  // tslint:disable-next-line: no-any
  valueEmitter: Observable<any>;
  idEmitter: Observable<string>;
}
