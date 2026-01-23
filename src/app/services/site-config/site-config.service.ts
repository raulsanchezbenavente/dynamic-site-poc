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
    return this.http.get<any>(
      document.location.port === '4200' ?
        'http://localhost:3000/assets/config-site/en/config-site.json'
        :
        '/assets/config-site/en/config-site.json').pipe(
      tap((site) => this._site$.next(site))
    );
  }
}
