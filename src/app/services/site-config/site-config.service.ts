import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ReplaySubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class SiteConfigService {
  private http = inject(HttpClient);

  private _site$ = new ReplaySubject<any>(1);
  site$ = this._site$.asObservable();

  load(): Observable<any> {
    return this.http.get<any>('http://localhost:3000/site').pipe(
      tap((site) => this._site$.next(site))
    );
  }
}
